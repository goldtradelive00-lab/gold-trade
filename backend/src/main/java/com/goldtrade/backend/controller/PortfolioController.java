package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.Holding;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.Transaction;
import com.goldtrade.backend.entity.WithdrawRequest;
import com.goldtrade.backend.exception.BadRequestException;
import com.goldtrade.backend.exception.ResourceNotFoundException;
import com.goldtrade.backend.repository.HoldingRepository;
import com.goldtrade.backend.repository.PortfolioRepository;
import com.goldtrade.backend.repository.TransactionRepository;
import com.goldtrade.backend.repository.WithdrawRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioRepository portfolioRepo;
    private final HoldingRepository holdingRepo;
    private final TransactionRepository transactionRepo;
    private final WithdrawRequestRepository withdrawRequestRepo;

    public PortfolioController(PortfolioRepository portfolioRepo,
                                HoldingRepository holdingRepo,
                                TransactionRepository transactionRepo,
                                WithdrawRequestRepository withdrawRequestRepo) {
        this.portfolioRepo = portfolioRepo;
        this.holdingRepo = holdingRepo;
        this.transactionRepo = transactionRepo;
        this.withdrawRequestRepo = withdrawRequestRepo;
    }

    // GET /api/portfolio — current investor's overview
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getMyPortfolio(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Portfolio portfolio = portfolioRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        List<Holding> holdings = holdingRepo.findByPortfolioId(portfolio.getId());
        BigDecimal holdingsValue = holdings.stream()
                .map(h -> h.getCurrentPrice().multiply(h.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalValue = holdingsValue.add(portfolio.getCashBalance());

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "portfolio_id", portfolio.getId(),
                "cash_balance", portfolio.getCashBalance(),
                "holdings_value", holdingsValue,
                "total_value", totalValue,
                "holdings", holdings
        )));
    }

    // GET /api/portfolio/transactions — current investor's recent activity
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<?>> getMyTransactions(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Portfolio portfolio = portfolioRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        List<Transaction> transactions = transactionRepo.findByPortfolioIdOrderByOccurredAtDesc(portfolio.getId());
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    // GET /api/portfolio/withdrawals — current investor's own withdrawal request history
    @GetMapping("/withdrawals")
    public ResponseEntity<ApiResponse<?>> getMyWithdrawals(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        List<WithdrawRequest> requests = withdrawRequestRepo.findByUserIdOrderByRequestedAtDesc(userId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    // POST /api/portfolio/deposits — instant credit (no approval needed)
    @PostMapping("/deposits")
    public ResponseEntity<ApiResponse<?>> deposit(@RequestBody Map<String, Object> body, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        BigDecimal amount = toAmount(body.get("amount"));
        String method = body.getOrDefault("method", "bank_transfer").toString();

        Portfolio portfolio = portfolioRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        portfolio.setCashBalance(portfolio.getCashBalance().add(amount));
        portfolioRepo.save(portfolio);

        Transaction tx = new Transaction();
        tx.setPortfolioId(portfolio.getId());
        tx.setType("deposit");
        tx.setDescription("Deposit via " + method.replace('_', ' '));
        tx.setAmount(amount);
        transactionRepo.save(tx);

        return ResponseEntity.ok(ApiResponse.success(null, "Deposit received"));
    }

    // POST /api/portfolio/withdrawals — submits a request for admin review
    @PostMapping("/withdrawals")
    public ResponseEntity<ApiResponse<?>> requestWithdrawal(@RequestBody Map<String, Object> body, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        BigDecimal amount = toAmount(body.get("amount"));
        String method = body.getOrDefault("method", "bank_transfer").toString();

        Portfolio portfolio = portfolioRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        if (amount.compareTo(portfolio.getCashBalance()) > 0) {
            throw new BadRequestException("Amount exceeds your available cash balance");
        }

        WithdrawRequest request = new WithdrawRequest();
        request.setUserId(userId);
        request.setAmount(amount);
        request.setMethod(method);
        request.setStatus("pending");
        withdrawRequestRepo.save(request);

        return ResponseEntity.ok(ApiResponse.success(null, "Withdrawal request submitted for review"));
    }

    private BigDecimal toAmount(Object raw) {
        BigDecimal amount;
        if (raw instanceof Number n) {
            amount = BigDecimal.valueOf(n.doubleValue());
        } else if (raw instanceof String s) {
            amount = new BigDecimal(s);
        } else {
            amount = BigDecimal.ZERO;
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Enter a valid amount");
        }
        return amount;
    }
}
