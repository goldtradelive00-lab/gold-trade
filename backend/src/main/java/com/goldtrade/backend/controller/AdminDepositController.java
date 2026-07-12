package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.Admin;
import com.goldtrade.backend.entity.DepositRequest;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.ReferralEarning;
import com.goldtrade.backend.entity.Transaction;
import com.goldtrade.backend.entity.User;
import com.goldtrade.backend.exception.BadRequestException;
import com.goldtrade.backend.exception.ResourceNotFoundException;
import com.goldtrade.backend.repository.AdminRepository;
import com.goldtrade.backend.repository.DepositRequestRepository;
import com.goldtrade.backend.repository.PortfolioRepository;
import com.goldtrade.backend.repository.ReferralEarningRepository;
import com.goldtrade.backend.repository.TransactionRepository;
import com.goldtrade.backend.repository.UserRepository;
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
@RequestMapping("/api/admin/deposit-requests")
public class AdminDepositController {

    private static final BigDecimal REFERRAL_COMMISSION_RATE = new BigDecimal("0.05");

    private final DepositRequestRepository depositRequestRepo;
    private final PortfolioRepository portfolioRepo;
    private final TransactionRepository transactionRepo;
    private final UserRepository userRepo;
    private final AdminRepository adminRepo;
    private final ReferralEarningRepository referralEarningRepo;
    private final NotificationService notificationService;

    public AdminDepositController(DepositRequestRepository depositRequestRepo,
                                   PortfolioRepository portfolioRepo,
                                   TransactionRepository transactionRepo,
                                   UserRepository userRepo,
                                   AdminRepository adminRepo,
                                   ReferralEarningRepository referralEarningRepo,
                                   NotificationService notificationService) {
        this.depositRequestRepo = depositRequestRepo;
        this.portfolioRepo = portfolioRepo;
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
        this.referralEarningRepo = referralEarningRepo;
        this.notificationService = notificationService;
    }

    // GET /api/admin/deposit-requests
    @GetMapping
    public ResponseEntity<ApiResponse<?>> list() {
        List<DepositRequest> requests = depositRequestRepo.findAllByOrderByRequestedAtDesc();
        List<Map<String, Object>> result = requests.stream().map(this::toRow).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // POST /api/admin/deposit-requests/{id}/approve — credits cash and logs a transaction
    @Transactional
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<?>> approve(@PathVariable String id, Authentication auth) {
        DepositRequest request = depositRequestRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deposit request not found"));
        if (!"pending".equals(request.getStatus())) {
            throw new BadRequestException("This request has already been reviewed");
        }

        Portfolio portfolio = portfolioRepo.findByUserId(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        portfolio.setCashBalance(portfolio.getCashBalance().add(request.getAmount()));
        // Deposits (not referral bonuses or profit) are the only thing that grows the
        // principal that earns the daily 1% — see DailyProfitService.
        portfolio.setPrincipalBalance(portfolio.getPrincipalBalance().add(request.getAmount()));
        portfolioRepo.save(portfolio);

        Transaction tx = new Transaction();
        tx.setPortfolioId(portfolio.getId());
        tx.setType("deposit");
        tx.setDescription("Deposit via " + request.getBankName());
        tx.setAmount(request.getAmount());
        transactionRepo.save(tx);

        User depositor = userRepo.findById(request.getUserId()).orElse(null);
        if (depositor != null && depositor.getReferredBy() != null) {
            creditReferralCommission(depositor.getReferredBy(), depositor, request);
        }

        request.setStatus("approved");
        request.setReviewedBy((String) auth.getPrincipal());
        request.setReviewedAt(OffsetDateTime.now(ZoneOffset.UTC));
        depositRequestRepo.save(request);

        notificationService.notifyInvestor(
                request.getUserId(),
                "deposit_approved",
                "Deposit approved",
                "Your deposit of " + formatAmount(request.getAmount()) + " was approved and credited to your account.",
                "/investor/deposit",
                "deposit"
        );

        return ResponseEntity.ok(ApiResponse.success(null, "Deposit approved"));
    }

    private void creditReferralCommission(String referrerId, User depositor, DepositRequest request) {
        Portfolio referrerPortfolio = portfolioRepo.findByUserId(referrerId).orElse(null);
        if (referrerPortfolio == null) return;

        BigDecimal commission = request.getAmount()
                .multiply(REFERRAL_COMMISSION_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        referrerPortfolio.setCashBalance(referrerPortfolio.getCashBalance().add(commission));
        portfolioRepo.save(referrerPortfolio);

        Transaction bonusTx = new Transaction();
        bonusTx.setPortfolioId(referrerPortfolio.getId());
        bonusTx.setType("referral_bonus");
        bonusTx.setDescription("Referral bonus from " + depositor.getFullName());
        bonusTx.setAmount(commission);
        transactionRepo.save(bonusTx);

        ReferralEarning earning = new ReferralEarning();
        earning.setReferrerId(referrerId);
        earning.setReferredUserId(depositor.getId());
        earning.setDepositRequestId(request.getId());
        earning.setDepositAmount(request.getAmount());
        earning.setCommissionAmount(commission);
        referralEarningRepo.save(earning);

        notificationService.notifyInvestor(
                referrerId,
                "referral_bonus",
                "Referral bonus earned",
                "You earned " + formatAmount(commission) + " (5%) from " + depositor.getFullName() + "'s approved deposit.",
                "/investor/refer",
                "referral"
        );
    }

    // POST /api/admin/deposit-requests/{id}/reject
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<?>> reject(@PathVariable String id, Authentication auth) {
        DepositRequest request = depositRequestRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deposit request not found"));
        if (!"pending".equals(request.getStatus())) {
            throw new BadRequestException("This request has already been reviewed");
        }

        request.setStatus("rejected");
        request.setReviewedBy((String) auth.getPrincipal());
        request.setReviewedAt(OffsetDateTime.now(ZoneOffset.UTC));
        depositRequestRepo.save(request);

        notificationService.notifyInvestor(
                request.getUserId(),
                "deposit_rejected",
                "Deposit not approved",
                "Your deposit request of " + formatAmount(request.getAmount()) + " was not approved. Contact support if you believe this is a mistake.",
                "/investor/deposit",
                "deposit"
        );

        return ResponseEntity.ok(ApiResponse.success(null, "Deposit rejected"));
    }

    private String formatAmount(BigDecimal amount) {
        return "Rs " + amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private Map<String, Object> toRow(DepositRequest request) {
        User investor = userRepo.findById(request.getUserId()).orElse(null);
        Admin reviewer = request.getReviewedBy() != null
                ? adminRepo.findById(request.getReviewedBy()).orElse(null)
                : null;
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", request.getId());
        map.put("customer", investor != null ? investor.getFullName() : "Unknown");
        map.put("email", investor != null ? investor.getEmail() : "");
        map.put("phone_number", investor != null ? investor.getPhoneNumber() : "");
        map.put("amount", request.getAmount());
        map.put("bank_name", request.getBankName());
        map.put("account_title", request.getAccountTitle());
        map.put("account_number", request.getAccountNumber());
        map.put("sender_whatsapp", request.getSenderWhatsapp());
        map.put("admin_whatsapp_number", request.getAdminWhatsappNumber());
        map.put("status", request.getStatus());
        map.put("requested_at", request.getRequestedAt());
        map.put("reviewed_at", request.getReviewedAt());
        map.put("reviewed_by_name", reviewer != null ? reviewer.getFullName() : null);
        return map;
    }
}
