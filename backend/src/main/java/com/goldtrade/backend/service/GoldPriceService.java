package com.goldtrade.backend.service;

import com.goldtrade.backend.entity.GoldPriceHistory;
import com.goldtrade.backend.repository.GoldPriceHistoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
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
    private static final int MAX_HISTORY_FETCHES_PER_CALL = 35; // caps external calls in a single backfill request
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
        throw new IllegalStateException("Gold price is currently unavailable");
    }

    public List<GoldPriceHistory> getDailyHistory(int days) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate start = today.minusDays(Math.max(0, days - 1L));

        List<GoldPriceHistory> existing = historyRepo.findByPriceDateBetweenOrderByPriceDateAsc(start, today);
        Map<LocalDate, GoldPriceHistory> byDate = new HashMap<>();
        for (GoldPriceHistory h : existing) byDate.put(h.getPriceDate(), h);

        int fetches = 0;
        for (LocalDate d = start; !d.isAfter(today); d = d.plusDays(1)) {
            if (byDate.containsKey(d)) continue;
            if (fetches >= MAX_HISTORY_FETCHES_PER_CALL) break;
            fetches++;
            GoldPriceHistory fetched = fetchHistoricalDay(d);
            if (fetched != null) {
                historyRepo.save(fetched);
                byDate.put(d, fetched);
            }
        }

        return byDate.values().stream()
                .sorted(Comparator.comparing(GoldPriceHistory::getPriceDate))
                .collect(Collectors.toList());
    }

    private GoldPriceHistory fetchHistoricalDay(LocalDate date) {
        String dateStr = date.format(DATE_FMT);
        GoldPriceHistory result = fetchHistoricalFromKey(key1, date, dateStr);
        if (result == null) result = fetchHistoricalFromKey(key2, date, dateStr);
        return result;
    }

    private GoldPriceHistory fetchHistoricalFromKey(String key, LocalDate date, String dateStr) {
        if (key == null || key.isBlank()) return null;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = webClient.get()
                    .uri("/XAU/PKR/" + dateStr)
                    .header("x-access-token", key)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (body == null || body.get("price_gram_24k") == null) return null;

            BigDecimal gram24k = new BigDecimal(body.get("price_gram_24k").toString())
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal perTola = gram24k.multiply(GRAMS_PER_TOLA).setScale(2, RoundingMode.HALF_UP);
            return new GoldPriceHistory(date, perTola, gram24k);
        } catch (Exception e) {
            log.warning("GoldAPI historical request failed for " + dateStr + ": " + e.getMessage());
            return null;
        }
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
