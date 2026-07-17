package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.User;
import com.goldtrade.backend.exception.ResourceNotFoundException;
import com.goldtrade.backend.repository.PortfolioRepository;
import com.goldtrade.backend.repository.TransactionRepository;
import com.goldtrade.backend.repository.UserRepository;
import com.goldtrade.backend.service.EmailService;
import com.goldtrade.backend.service.RefreshTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

// Backs the admin "Customers" screen — endpoint path kept as /investors to
// match the frontend routes already wired up.
@RestController
@RequestMapping("/api/admin/investors")
public class AdminInvestorController {

    private final UserRepository userRepo;
    private final PortfolioRepository portfolioRepo;
    private final TransactionRepository transactionRepo;
    private final EmailService emailService;
    private final RefreshTokenService refreshTokenService;

    public AdminInvestorController(UserRepository userRepo,
                                    PortfolioRepository portfolioRepo,
                                    TransactionRepository transactionRepo,
                                    EmailService emailService,
                                    RefreshTokenService refreshTokenService) {
        this.userRepo = userRepo;
        this.portfolioRepo = portfolioRepo;
        this.transactionRepo = transactionRepo;
        this.emailService = emailService;
        this.refreshTokenService = refreshTokenService;
    }

    // GET /api/admin/investors — list all customers with portfolio total
    @GetMapping
    public ResponseEntity<ApiResponse<?>> listInvestors() {
        List<User> customers = userRepo.findAll();
        List<Map<String, Object>> result = customers.stream().map(this::toSummary).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // GET /api/admin/investors/{id} — full customer detail
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getInvestor(@PathVariable String id) {
        User customer = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Map<String, Object> summary = toSummary(customer);

        Portfolio portfolio = portfolioRepo.findByUserId(id).orElse(null);
        Map<String, Object> data = new java.util.HashMap<>(summary);
        if (portfolio != null) {
            data.put("transactions", transactionRepo.findByPortfolioIdOrderByOccurredAtDesc(portfolio.getId()));
        }
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // POST /api/admin/investors/{id}/approve
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<?>> approve(@PathVariable String id) {
        User customer = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        customer.setIsApproved(true);
        customer.setRejectionReason(null);
        userRepo.save(customer);

        try {
            emailService.sendApprovalEmail(customer.getEmail(),
                    customer.getFullName() != null ? customer.getFullName() : customer.getEmail());
        } catch (Exception ignored) {
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Customer approved"));
    }

    // POST /api/admin/investors/{id}/reject
    @Transactional
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<?>> reject(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        User customer = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        String reason = body != null ? (String) body.get("reason") : null;
        customer.setIsApproved(false);
        customer.setRejectionReason(reason);
        userRepo.save(customer);
        refreshTokenService.revokeAllForUser(customer.getId());

        try {
            emailService.sendRejectionEmail(customer.getEmail(),
                    customer.getFullName() != null ? customer.getFullName() : customer.getEmail(), reason);
        } catch (Exception ignored) {
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Customer rejected"));
    }

    private Map<String, Object> toSummary(User customer) {
        Portfolio portfolio = portfolioRepo.findByUserId(customer.getId()).orElse(null);
        BigDecimal totalValue = portfolio != null ? portfolio.getCashBalance() : BigDecimal.ZERO;
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", customer.getId());
        map.put("goldtrade_id", customer.getGoldtradeId());
        map.put("email", customer.getEmail());
        map.put("full_name", customer.getFullName());
        map.put("phone_number", customer.getPhoneNumber());
        map.put("is_approved", customer.getIsApproved());
        map.put("email_verified", customer.getEmailVerified());
        map.put("kyc_status", customer.getKycStatus());
        map.put("rejection_reason", customer.getRejectionReason());
        map.put("created_at", customer.getCreatedAt());
        map.put("portfolio_total_value", totalValue);
        return map;
    }
}
