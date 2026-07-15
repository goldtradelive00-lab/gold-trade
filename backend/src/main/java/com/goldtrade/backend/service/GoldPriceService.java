package com.goldtrade.backend.service;

import com.goldtrade.backend.entity.GoldPriceHistory;
import com.goldtrade.backend.repository.GoldPriceHistoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class GoldPriceService {

    private static final Logger log = Logger.getLogger(GoldPriceService.class.getName());
    private static final BigDecimal GRAMS_PER_TOLA = BigDecimal.valueOf(11.6638);
    private static final long CACHE_TTL_SECONDS = 600; // refresh at most every 10 minutes — free-tier quota is 100 req/mo per key
    private static final int MAX_HISTORY_FETCHES_PER_CALL = 30; // caps external calls in a single backfill request
    private static final int HISTORY_FETCH_CONCURRENCY = 6; // fetched in parallel rather than one-at-a-time
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final WebClient webClient;
    private final GoldPriceHistoryRepository historyRepo;

    @Value("${goldapi.key1}")
    private String key1;

    @Value("${goldapi.key2}")
    private String key2;

    private final AtomicReference<GoldPrice> cache = new AtomicReference<>();

    public GoldPriceService(WebClient.Builder builder, GoldPriceHistoryRepository historyRepo) {
        this.webClient = builder.baseUrl("https://www.goldapi.io/api").build();
        this.historyRepo = historyRepo;
    }

    public record GoldPrice(BigDecimal pricePerTola, BigDecimal pricePerGram24k, Instant fetchedAt, boolean live) {}

    public GoldPrice getPrice() {
        GoldPrice cached = cache.get();
        if (cached != null && Instant.now().isBefore(cached.fetchedAt().plusSeconds(CACHE_TTL_SECONDS))) {
            return cached;
        }

        GoldPrice fresh = fetchLiveFromKey(key1);
        if (fresh == null) {
            fresh = fetchLiveFromKey(key2);
        }
        if (fresh != null) {
            cache.set(fresh);
            return fresh;
        }

        if (cached != null) {
            // Both keys failed (quota exhausted or network issue) — serve the last known price rather than break the UI
            return new GoldPrice(cached.pricePerTola(), cached.pricePerGram24k(), cached.fetchedAt(), false);
        }

        // Fresh process with an empty in-memory cache AND a failing API (e.g. just after a
        // restart): fall back to the most recent day we persisted, so the endpoint degrades to
        // "last known" instead of a 500. Only genuinely fail if we've never stored anything.
        GoldPriceHistory latest = historyRepo.findTopByOrderByPriceDateDesc().orElse(null);
        if (latest != null) {
            GoldPrice fallback = new GoldPrice(
                    latest.getPricePerTola(),
                    latest.getPricePerGram24k(),
                    latest.getPriceDate().atStartOfDay().toInstant(ZoneOffset.UTC),
                    false);
            cache.set(fallback);
            return fallback;
        }
        throw new IllegalStateException("Gold price is currently unavailable");
    }

    public List<GoldPriceHistory> getDailyHistory(int days) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate start = today.minusDays(Math.max(0, days - 1L));

        List<GoldPriceHistory> existing = historyRepo.findByPriceDateBetweenOrderByPriceDateAsc(start, today);
        Map<LocalDate, GoldPriceHistory> byDate = new HashMap<>();
        for (GoldPriceHistory h : existing) byDate.put(h.getPriceDate(), h);

        List<LocalDate> missing = new ArrayList<>();
        for (LocalDate d = start; !d.isAfter(today); d = d.plusDays(1)) {
            if (!byDate.containsKey(d)) missing.add(d);
        }
        // Prioritize the most recent missing days so the visible chart fills in from "now" backwards
        if (missing.size() > MAX_HISTORY_FETCHES_PER_CALL) {
            missing = missing.subList(missing.size() - MAX_HISTORY_FETCHES_PER_CALL, missing.size());
        }

        if (!missing.isEmpty()) {
            List<GoldPriceHistory> fetched = Flux.fromIterable(missing)
                    .flatMap(this::fetchHistoricalDayAsync, HISTORY_FETCH_CONCURRENCY)
                    .collectList()
                    .block();
            if (fetched != null) {
                for (GoldPriceHistory h : fetched) {
                    if (h != null) {
                        historyRepo.save(h);
                        byDate.put(h.getPriceDate(), h);
                    }
                }
            }
        }

        return byDate.values().stream()
                .sorted(Comparator.comparing(GoldPriceHistory::getPriceDate))
                .collect(Collectors.toList());
    }

    private Mono<GoldPriceHistory> fetchHistoricalDayAsync(LocalDate date) {
        String dateStr = date.format(DATE_FMT);
        return fetchHistoricalFromKeyAsync(key1, date, dateStr)
                .switchIfEmpty(Mono.defer(() -> fetchHistoricalFromKeyAsync(key2, date, dateStr)));
    }

    private Mono<GoldPriceHistory> fetchHistoricalFromKeyAsync(String key, LocalDate date, String dateStr) {
        if (key == null || key.isBlank()) return Mono.empty();
        return webClient.get()
                .uri("/XAU/PKR/" + dateStr)
                .header("x-access-token", key)
                .retrieve()
                .bodyToMono(Map.class)
                .mapNotNull(body -> toHistoryRow(date, body))
                .onErrorResume(e -> {
                    log.warning("GoldAPI historical request failed for " + dateStr + ": " + e.getMessage());
                    return Mono.empty();
                });
    }

    @SuppressWarnings("unchecked")
    private GoldPriceHistory toHistoryRow(LocalDate date, Map<?, ?> body) {
        if (body == null || body.get("price_gram_24k") == null) return null;
        BigDecimal gram24k = new BigDecimal(body.get("price_gram_24k").toString())
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal perTola = gram24k.multiply(GRAMS_PER_TOLA).setScale(2, RoundingMode.HALF_UP);
        return new GoldPriceHistory(date, perTola, gram24k);
    }

    private GoldPrice fetchLiveFromKey(String key) {
        if (key == null || key.isBlank()) return null;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = webClient.get()
                    .uri("/XAU/PKR")
                    .header("x-access-token", key)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (body == null || body.get("price_gram_24k") == null) return null;

            BigDecimal gram24k = new BigDecimal(body.get("price_gram_24k").toString())
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal perTola = gram24k.multiply(GRAMS_PER_TOLA).setScale(2, RoundingMode.HALF_UP);
            return new GoldPrice(perTola, gram24k, Instant.now(), true);
        } catch (Exception e) {
            log.warning("GoldAPI request failed: " + e.getMessage());
            return null;
        }
    }
}
