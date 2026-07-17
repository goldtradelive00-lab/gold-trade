package com.goldtrade.backend.service;

import com.goldtrade.backend.entity.GoldPriceHistory;
import com.goldtrade.backend.repository.GoldPriceHistoryRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class GoldPriceHistoryService {

    private static final BigDecimal DEFAULT_PRICE = new BigDecimal("2650.00");
    // Bounded random walk step so backfilled/auto-generated days stay in a believable range
    // around whatever the real (admin-set or default) anchor price is.
    private static final double MAX_DAILY_STEP = 24.0;

    private final GoldPriceHistoryRepository historyRepo;
    private final Random random = new Random();

    public GoldPriceHistoryService(GoldPriceHistoryRepository historyRepo) {
        this.historyRepo = historyRepo;
    }

    // Returns today's stored price, auto-generating (and persisting) one from the last known
    // day if today doesn't have a row yet — so it's stable for the rest of the day.
    public GoldPriceHistory getTodayPrice() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        return historyRepo.findById(today).orElseGet(() -> insertToday(today));
    }

    // The landing page and dashboard both fire concurrent requests that can each observe
    // "no row for today" before either commits, so the insert can lose a race — fall back to
    // the winner's row instead of surfacing a duplicate-key error.
    private GoldPriceHistory insertToday(LocalDate today) {
        BigDecimal base = historyRepo.findTopByPriceDateLessThanOrderByPriceDateDesc(today)
                .map(GoldPriceHistory::getPrice)
                .orElse(DEFAULT_PRICE);
        BigDecimal price = step(base);
        try {
            return historyRepo.save(new GoldPriceHistory(today, price));
        } catch (DataIntegrityViolationException e) {
            return historyRepo.findById(today).orElseThrow(() -> e);
        }
    }

    // Admin override — sets (or replaces) today's stored price exactly.
    public GoldPriceHistory setTodayPrice(BigDecimal price) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        GoldPriceHistory row = historyRepo.findById(today).orElse(new GoldPriceHistory(today, price));
        row.setPrice(price);
        return historyRepo.save(row);
    }

    // Returns the last `days` days of history, backfilling (and persisting) any gaps once so
    // the series stays stable on every subsequent read.
    public List<GoldPriceHistory> getHistory(int days) {
        int clampedDays = Math.max(1, Math.min(days, 365));
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        getTodayPrice(); // ensure today's row exists before computing the range

        LocalDate start = today.minusDays(clampedDays - 1L);
        List<GoldPriceHistory> existing = historyRepo.findByPriceDateBetweenOrderByPriceDateAsc(start, today);
        Map<LocalDate, GoldPriceHistory> byDate = new HashMap<>();
        for (GoldPriceHistory h : existing) byDate.put(h.getPriceDate(), h);

        // Anchor for backfilling backward from the earliest known day (or today's price if
        // nothing else exists yet).
        LocalDate earliestKnown = byDate.keySet().stream().min(LocalDate::compareTo).orElse(today);
        BigDecimal anchor = byDate.get(earliestKnown).getPrice();

        List<GoldPriceHistory> toSave = new ArrayList<>();
        for (LocalDate d = earliestKnown.minusDays(1); !d.isBefore(start); d = d.minusDays(1)) {
            anchor = step(anchor);
            GoldPriceHistory row = new GoldPriceHistory(d, anchor);
            byDate.put(d, row);
            toSave.add(row);
        }
        if (!toSave.isEmpty()) {
            try {
                historyRepo.saveAll(toSave);
            } catch (DataIntegrityViolationException e) {
                // Another concurrent request already backfilled (some of) this range;
                // re-read what's now stored instead of failing the whole request.
                for (GoldPriceHistory h : historyRepo.findByPriceDateBetweenOrderByPriceDateAsc(start, today)) {
                    byDate.put(h.getPriceDate(), h);
                }
            }
        }

        return byDate.values().stream()
                .sorted((a, b) -> a.getPriceDate().compareTo(b.getPriceDate()))
                .toList();
    }

    private BigDecimal step(BigDecimal base) {
        double delta = (random.nextDouble() - 0.5) * MAX_DAILY_STEP;
        BigDecimal next = base.add(BigDecimal.valueOf(delta));
        BigDecimal floor = base.multiply(new BigDecimal("0.85"));
        BigDecimal ceil = base.multiply(new BigDecimal("1.15"));
        if (next.compareTo(floor) < 0) next = floor;
        if (next.compareTo(ceil) > 0) next = ceil;
        return next.setScale(2, RoundingMode.HALF_UP);
    }
}
