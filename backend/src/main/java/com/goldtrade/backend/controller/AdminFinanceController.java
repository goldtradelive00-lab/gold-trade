package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.Transaction;
import com.goldtrade.backend.entity.User;
import com.goldtrade.backend.entity.WithdrawRequest;
import com.goldtrade.backend.repository.PortfolioRepository;
import com.goldtrade.backend.repository.TransactionRepository;
import com.goldtrade.backend.repository.UserRepository;
import com.goldtrade.backend.repository.WithdrawRequestRepository;
import com.goldtrade.backend.service.DailyProfitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Platform-wide money in / money out overview for the admin "Finance" tab.
@RestController
@RequestMapping("/api/admin/finance")
public class AdminFinanceController {

    private final TransactionRepository transactionRepo;
    private final PortfolioRepository portfolioRepo;
    private final UserRepository userRepo;
    private final WithdrawRequestRepository withdrawRequestRepo;
    private final DailyProfitService dailyProfitService;

    public AdminFinanceController(TransactionRepository transactionRepo,
                                   PortfolioRepository portfolioRepo,
                                   UserRepository userRepo,
                                   WithdrawRequestRepository withdrawRequestRepo,
                                   DailyProfitService dailyProfitService) {
        this.transactionRepo = transactionRepo;
        this.portfolioRepo = portfolioRepo;
        this.userRepo = userRepo;
        this.withdrawRequestRepo = withdrawRequestRepo;
        this.dailyProfitService = dailyProfitService;
    }

    // POST /api/admin/finance/run-daily-profit — manually trigger the daily 1% profit run
    // (the scheduled job already runs this once a day at midnight; this is for ops use if
    // the server was down, or to verify the feature without waiting for midnight)
    @PostMapping("/run-daily-profit")
    public ResponseEntity<ApiResponse<?>> runDailyProfit() {
        int credited = dailyProfitService.runDailyProfit();
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("portfolios_credited", credited),
                "Daily profit credited to " + credited + " portfolio(s)"));
    }

    // GET /api/admin/finance/overview — platform-wide totals
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<?>> overview() {
        List<Transaction> all = transactionRepo.findAll();

        BigDecimal deposits = sumByType(all, "deposit");
        BigDecimal withdrawals = sumByType(all, "withdrawal");
        BigDecimal referralBonuses = sumByType(all, "referral_bonus");
        BigDecimal dailyProfits = sumByType(all, "daily_profit");
        BigDecimal moneyIn = deposits.add(referralBonuses).add(dailyProfits);
        BigDecimal moneyOut = withdrawals;
        BigDecimal netFlow = moneyIn.subtract(withdrawals);

        List<WithdrawRequest> pending = withdrawRequestRepo.findAllByOrderByRequestedAtDesc().stream()
                .filter(w -> "pending".equals(w.getStatus()))
                .toList();
        BigDecimal pendingAmount = pending.stream()
                .map(WithdrawRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Portfolio> portfolios = portfolioRepo.findAll();
        BigDecimal totalCash = portfolios.stream()
                .map(Portfolio::getCashBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new HashMap<>();
        result.put("total_deposits", deposits);
        result.put("total_withdrawals", withdrawals);
        result.put("total_referral_bonuses", referralBonuses);
        result.put("total_daily_profits", dailyProfits);
        result.put("money_in", moneyIn);
        result.put("money_out", moneyOut);
        result.put("net_flow", netFlow);
        result.put("total_aum", totalCash);
        result.put("total_cash_balance", totalCash);
        result.put("pending_withdrawals_amount", pendingAmount);
        result.put("pending_withdrawals_count", pending.size());
        result.put("transaction_count", all.size());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // GET /api/admin/finance/transactions — full ledger across every investor
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<?>> transactions() {
        List<Transaction> all = transactionRepo.findAllByOrderByOccurredAtDesc();

        Map<String, Portfolio> portfolioById = portfolioRepo.findAll().stream()
                .collect(Collectors.toMap(Portfolio::getId, p -> p));
        Map<String, User> userById = userRepo.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<Map<String, Object>> rows = all.stream().map(t -> {
            Portfolio portfolio = portfolioById.get(t.getPortfolioId());
            User investor = portfolio != null ? userById.get(portfolio.getUserId()) : null;

            Map<String, Object> row = new HashMap<>();
            row.put("id", t.getId());
            row.put("investor_name", investor != null ? investor.getFullName() : "Unknown");
            row.put("investor_email", investor != null ? investor.getEmail() : "");
            row.put("type", t.getType());
            row.put("description", t.getDescription());
            row.put("amount", t.getAmount());
            row.put("occurred_at", t.getOccurredAt());
            return row;
        }).toList();

        return ResponseEntity.ok(ApiResponse.success(rows));
    }

    private BigDecimal sumByType(List<Transaction> transactions, String type) {
        return transactions.stream()
                .filter(t -> type.equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
