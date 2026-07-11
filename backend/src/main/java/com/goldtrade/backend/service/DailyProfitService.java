package com.goldtrade.backend.service;

import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.Transaction;
import com.goldtrade.backend.repository.PortfolioRepository;
import com.goldtrade.backend.repository.TransactionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.logging.Logger;

// Credits every investor 1% of their deposited principal once per day. This is simple
// (non-compounding) interest: the 1% is always computed from principal_balance, which only
// changes on deposits/withdrawals — profit itself is credited to cash_balance only, so it
// never becomes part of next day's calculation, and referral bonuses never count as principal.
@Service
public class DailyProfitService {

    private static final Logger log = Logger.getLogger(DailyProfitService.class.getName());
    private static final BigDecimal DAILY_PROFIT_RATE = new BigDecimal("0.01");

    private final PortfolioRepository portfolioRepo;
    private final TransactionRepository transactionRepo;

    public DailyProfitService(PortfolioRepository portfolioRepo, TransactionRepository transactionRepo) {
        this.portfolioRepo = portfolioRepo;
        this.transactionRepo = transactionRepo;
    }

    @Scheduled(cron = "0 0 0 * * *") // once a day at midnight, server time
    @Transactional
    public int runDailyProfit() {
        List<Portfolio> portfolios = portfolioRepo.findAll();
        OffsetDateTime startOfToday = LocalDate.now(ZoneOffset.UTC).atStartOfDay().atOffset(ZoneOffset.UTC);
        int credited = 0;

        for (Portfolio portfolio : portfolios) {
            if (portfolio.getPrincipalBalance().compareTo(BigDecimal.ZERO) <= 0) continue;

            // Skip if this portfolio was already credited today — guards against the
            // scheduled job and the manual admin trigger both firing the same day.
            boolean alreadyCreditedToday = transactionRepo.existsByPortfolioIdAndTypeAndOccurredAtAfter(
                    portfolio.getId(), "daily_profit", startOfToday);
            if (alreadyCreditedToday) continue;

            BigDecimal profit = portfolio.getPrincipalBalance()
                    .multiply(DAILY_PROFIT_RATE)
                    .setScale(2, RoundingMode.HALF_UP);
            if (profit.compareTo(BigDecimal.ZERO) <= 0) continue;

            portfolio.setCashBalance(portfolio.getCashBalance().add(profit));
            portfolioRepo.save(portfolio);

            Transaction tx = new Transaction();
            tx.setPortfolioId(portfolio.getId());
            tx.setType("daily_profit");
            tx.setDescription("Daily 1% profit on principal");
            tx.setAmount(profit);
            transactionRepo.save(tx);

            credited++;
        }

        log.info("Daily profit run: credited " + credited + " of " + portfolios.size() + " portfolios");
        return credited;
    }
}
