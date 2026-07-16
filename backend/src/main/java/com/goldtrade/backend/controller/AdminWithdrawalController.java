package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.Admin;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.Transaction;
import com.goldtrade.backend.entity.Treasury;
import com.goldtrade.backend.entity.User;
import com.goldtrade.backend.entity.WithdrawRequest;
import com.goldtrade.backend.exception.BadRequestException;
import com.goldtrade.backend.exception.ResourceNotFoundException;
import com.goldtrade.backend.repository.AdminRepository;
import com.goldtrade.backend.repository.PortfolioRepository;
import com.goldtrade.backend.repository.TransactionRepository;
import com.goldtrade.backend.repository.TreasuryRepository;
import com.goldtrade.backend.repository.UserRepository;
import com.goldtrade.backend.repository.WithdrawRequestRepository;
import com.goldtrade.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/withdrawals")
public class AdminWithdrawalController {

    private static final String TREASURY_ID = "main";

    private final WithdrawRequestRepository withdrawRequestRepo;
    private final PortfolioRepository portfolioRepo;
    private final TransactionRepository transactionRepo;
    private final UserRepository userRepo;
    private final AdminRepository adminRepo;
    private final TreasuryRepository treasuryRepo;
    private final NotificationService notificationService;

    public AdminWithdrawalController(WithdrawRequestRepository withdrawRequestRepo,
                                      PortfolioRepository portfolioRepo,
                                      TransactionRepository transactionRepo,
                                      UserRepository userRepo,
                                      AdminRepository adminRepo,
                                      TreasuryRepository treasuryRepo,
                                      NotificationService notificationService) {
        this.withdrawRequestRepo = withdrawRequestRepo;
        this.portfolioRepo = portfolioRepo;
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
        this.treasuryRepo = treasuryRepo;
        this.notificationService = notificationService;
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

        Treasury treasury = treasuryRepo.findById(TREASURY_ID).orElse(null);
        if (treasury != null && request.getAmount().compareTo(treasury.getBalance()) > 0) {
            throw new BadRequestException("Treasury balance is insufficient to fund this withdrawal");
        }

        portfolio.setCashBalance(portfolio.getCashBalance().subtract(request.getAmount()));
        // Withdrawals draw down principal first (referral bonuses and prior profit credits
        // are cash but were never counted as principal), so future daily 1% profit is based
        // on what's actually left of the investor's deposited principal.
        portfolio.setPrincipalBalance(
                portfolio.getPrincipalBalance().subtract(request.getAmount()).max(BigDecimal.ZERO));
        portfolioRepo.save(portfolio);

        Transaction tx = new Transaction();
        tx.setPortfolioId(portfolio.getId());
        tx.setType("withdrawal");
        tx.setDescription("Withdrawal via " + (request.getBankName() != null ? request.getBankName() : request.getMethod()));
        tx.setAmount(request.getAmount());
        transactionRepo.save(tx);

        // Approved withdrawals send real cash out of the business, so the platform treasury
        // shrinks by the same amount — see AdminDepositController for the mirrored increase.
        if (treasury != null) {
            treasury.setBalance(treasury.getBalance().subtract(request.getAmount()));
            treasuryRepo.save(treasury);
        }

        request.setStatus("approved");
        request.setReviewedBy((String) auth.getPrincipal());
        request.setReviewedAt(OffsetDateTime.now(ZoneOffset.UTC));
        withdrawRequestRepo.save(request);

        notificationService.notifyInvestor(
                request.getUserId(),
                "withdrawal_approved",
                "Withdrawal approved",
                "Your withdrawal of " + formatAmount(request.getAmount()) + " was approved and sent to your account.",
                "/investor/withdraw",
                "withdraw"
        );

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

        notificationService.notifyInvestor(
                request.getUserId(),
                "withdrawal_rejected",
                "Withdrawal not approved",
                "Your withdrawal request of " + formatAmount(request.getAmount()) + " was not approved. Contact support if you believe this is a mistake.",
                "/investor/withdraw",
                "withdraw"
        );

        return ResponseEntity.ok(ApiResponse.success(null, "Withdrawal rejected"));
    }

    private String formatAmount(BigDecimal amount) {
        return "Rs " + amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
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
