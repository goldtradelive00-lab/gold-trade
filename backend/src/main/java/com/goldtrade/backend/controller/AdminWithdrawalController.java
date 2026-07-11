package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.Admin;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.Transaction;
import com.goldtrade.backend.entity.User;
import com.goldtrade.backend.entity.WithdrawRequest;
import com.goldtrade.backend.exception.BadRequestException;
import com.goldtrade.backend.exception.ResourceNotFoundException;
import com.goldtrade.backend.repository.AdminRepository;
import com.goldtrade.backend.repository.PortfolioRepository;
import com.goldtrade.backend.repository.TransactionRepository;
import com.goldtrade.backend.repository.UserRepository;
import com.goldtrade.backend.repository.WithdrawRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/withdrawals")
public class AdminWithdrawalController {

    private final WithdrawRequestRepository withdrawRequestRepo;
    private final PortfolioRepository portfolioRepo;
    private final TransactionRepository transactionRepo;
    private final UserRepository userRepo;
    private final AdminRepository adminRepo;

    public AdminWithdrawalController(WithdrawRequestRepository withdrawRequestRepo,
                                      PortfolioRepository portfolioRepo,
                                      TransactionRepository transactionRepo,
                                      UserRepository userRepo,
                                      AdminRepository adminRepo) {
        this.withdrawRequestRepo = withdrawRequestRepo;
        this.portfolioRepo = portfolioRepo;
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
    }

    // GET /api/admin/withdrawals
    @GetMapping
    public ResponseEntity<ApiResponse<?>> list() {
        List<WithdrawRequest> requests = withdrawRequestRepo.findAllByOrderByRequestedAtDesc();
        List<Map<String, Object>> result = requests.stream().map(this::toRow).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // POST /api/admin/withdrawals/{id}/approve — deducts cash and logs a transaction
    @Transactional
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<?>> approve(@PathVariable String id, Authentication auth) {
        WithdrawRequest request = withdrawRequestRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request not found"));
        if (!"pending".equals(request.getStatus())) {
            throw new BadRequestException("This request has already been reviewed");
        }

        Portfolio portfolio = portfolioRepo.findByUserId(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        if (request.getAmount().compareTo(portfolio.getCashBalance()) > 0) {
            throw new BadRequestException("Customer's cash balance is no longer sufficient");
        }

        portfolio.setCashBalance(portfolio.getCashBalance().subtract(request.getAmount()));
        portfolioRepo.save(portfolio);

        Transaction tx = new Transaction();
        tx.setPortfolioId(portfolio.getId());
        tx.setType("withdrawal");
        tx.setDescription("Withdrawal via " + (request.getBankName() != null ? request.getBankName() : request.getMethod()));
        tx.setAmount(request.getAmount());
        transactionRepo.save(tx);

        request.setStatus("approved");
        request.setReviewedBy((String) auth.getPrincipal());
        request.setReviewedAt(OffsetDateTime.now(ZoneOffset.UTC));
        withdrawRequestRepo.save(request);

        return ResponseEntity.ok(ApiResponse.success(null, "Withdrawal approved"));
    }

    // POST /api/admin/withdrawals/{id}/reject
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<?>> reject(@PathVariable String id, Authentication auth) {
        WithdrawRequest request = withdrawRequestRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request not found"));
        if (!"pending".equals(request.getStatus())) {
            throw new BadRequestException("This request has already been reviewed");
        }

        request.setStatus("rejected");
        request.setReviewedBy((String) auth.getPrincipal());
        request.setReviewedAt(OffsetDateTime.now(ZoneOffset.UTC));
        withdrawRequestRepo.save(request);

        return ResponseEntity.ok(ApiResponse.success(null, "Withdrawal rejected"));
    }

    private Map<String, Object> toRow(WithdrawRequest request) {
        User customer = userRepo.findById(request.getUserId()).orElse(null);
        Admin reviewer = request.getReviewedBy() != null
                ? adminRepo.findById(request.getReviewedBy()).orElse(null)
                : null;
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", request.getId());
        map.put("customer", customer != null ? customer.getFullName() : "Unknown");
        map.put("email", customer != null ? customer.getEmail() : "");
        map.put("phone_number", customer != null ? customer.getPhoneNumber() : "");
        map.put("amount", request.getAmount());
        map.put("bank_name", request.getBankName() != null ? request.getBankName() : request.getMethod());
        map.put("account_title", request.getAccountTitle());
        map.put("account_number", request.getAccountNumber());
        map.put("status", request.getStatus());
        map.put("requested_at", request.getRequestedAt());
        map.put("reviewed_at", request.getReviewedAt());
        map.put("reviewed_by_name", reviewer != null ? reviewer.getFullName() : null);
        return map;
    }
}
