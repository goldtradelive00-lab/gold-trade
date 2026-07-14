package com.goldtrade.backend.service;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.logging.Logger;

// Runs one daily-profit pass when the app comes up. The scheduled midnight run is skipped
// entirely if the server happens to be down at that moment; this catch-up credits the current
// day's profit on the next startup. It's a separate bean (not a self-call inside
// DailyProfitService) so the call goes through the transactional proxy. The per-day
// idempotency guard inside runDailyProfit() makes this a no-op if today was already credited.
@Component
public class StartupCatchUp {

    private static final Logger log = Logger.getLogger(StartupCatchUp.class.getName());

    private final DailyProfitService dailyProfitService;

    public StartupCatchUp(DailyProfitService dailyProfitService) {
        this.dailyProfitService = dailyProfitService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void creditMissedDailyProfitOnStartup() {
        try {
            int credited = dailyProfitService.runDailyProfit();
            log.info("Startup daily-profit catch-up credited " + credited + " portfolio(s)");
        } catch (Exception e) {
            log.warning("Startup daily-profit catch-up failed: " + e.getMessage());
        }
    }
}
