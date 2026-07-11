package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.AppSetting;
import com.goldtrade.backend.entity.DepositRequest;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.ReferralEarning;
import com.goldtrade.backend.entity.Transaction;
import com.goldtrade.backend.entity.User;
import com.goldtrade.backend.entity.WithdrawRequest;
import com.goldtrade.backend.exception.BadRequestException;
import com.goldtrade.backend.exception.ResourceNotFoundException;
import com.goldtrade.backend.repository.AppSettingRepository;
import com.goldtrade.backend.repository.DepositRequestRepository;
import com.goldtrade.backend.repository.PortfolioRepository;
import com.goldtrade.backend.repository.ReferralEarningRepository;
import com.goldtrade.backend.repository.TransactionRepository;
import com.goldtrade.backend.repository.UserRepository;
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

    private static final String DEPOSIT_WHATSAPP_KEY = "deposit_whatsapp_number";
    private static final String DEPOSIT_WHATSAPP_DEFAULT = "03001234567";

    private final PortfolioRepository portfolioRepo;
    private final TransactionRepository transactionRepo;
    private final WithdrawRequestRepository withdrawRequestRepo;
    private final DepositRequestRepository depositRequestRepo;
    private final AppSettingRepository settingRepo;
    private final UserRepository userRepo;
    private final ReferralEarningRepository referralEarningRepo;

    public PortfolioController(PortfolioRepository portfolioRepo,
                                TransactionRepository transactionRepo,
                                WithdrawRequestRepository withdrawRequestRepo,
                                DepositRequestRepository depositRequestRepo,
                                AppSettingRepository settingRepo,
                                UserRepository userRepo,
                                ReferralEarningRepository referralEarningRepo) {
        this.portfolioRepo = portfolioRepo;
        this.transactionRepo = transactionRepo;
        this.withdrawRequestRepo = withdrawRequestRepo;
        this.depositRequestRepo = depositRequestRepo;
        this.settingRepo = settingRepo;
        this.userRepo = userRepo;
        this.referralEarningRepo = referralEarningRepo;
    }

    // GET /api/portfolio — current investor's overview
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getMyPortfolio(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Portfolio portfolio = portfolioRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "portfolio_id", portfolio.getId(),
                "cash_balance", portfolio.getCashBalance(),
                "principal_balance", portfolio.getPrincipalBalance(),
                "total_value", portfolio.getCashBalance()
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

    // GET /api/portfolio/deposit-requests — current investor's own deposit request history
    @GetMapping("/deposit-requests")
    public ResponseEntity<ApiResponse<?>> getMyDepositRequests(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        List<DepositRequest> requests = depositRequestRepo.findByUserIdOrderByRequestedAtDesc(userId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    // POST /api/portfolio/deposit-requests — submits a request for admin review once the
    // investor has sent a receipt via WhatsApp; cash is only credited on approval
    @PostMapping("/deposit-requests")
    public ResponseEntity<ApiResponse<?>> requestDeposit(@RequestBody Map<String, Object> body, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        BigDecimal amount = toAmount(body.get("amount"));
        String bankName = requireText(body.get("bank_name"), "Select a bank or wallet");
        String accountTitle = requireText(body.get("account_title"), "Enter the account title");
        String accountNumber = requireText(body.get("account_number"), "Enter the account number or IBAN");
        String senderWhatsapp = requireText(body.get("sender_whatsapp"),
                "Enter the WhatsApp number you used to send the receipt");

        String adminWhatsapp = settingRepo.findById(DEPOSIT_WHATSAPP_KEY)
                .map(AppSetting::getValue)
                .orElse(DEPOSIT_WHATSAPP_DEFAULT);

        DepositRequest request = new DepositRequest();
        request.setUserId(userId);
        request.setAmount(amount);
        request.setBankName(bankName);
        request.setAccountTitle(accountTitle);
        request.setAccountNumber(accountNumber);
        request.setSenderWhatsapp(senderWhatsapp);
        request.setAdminWhatsappNumber(adminWhatsapp);
        request.setStatus("pending");
        depositRequestRepo.save(request);

        return ResponseEntity.ok(ApiResponse.success(null, "Deposit request submitted for review"));
    }

    // GET /api/portfolio/referrals — investors referred by me, and my 5% deposit-commission earnings
    @GetMapping("/referrals")
    public ResponseEntity<ApiResponse<?>> getMyReferrals(Authentication auth) {
        String userId = (String) auth.getPrincipal();

        List<User> referredUsers = userRepo.findByReferredByOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> referredRows = referredUsers.stream().map(u -> {
            Map<String, Object> row = new java.util.HashMap<>();
            row.put("id", u.getId());
            row.put("full_name", u.getFullName());
            row.put("email", u.getEmail());
            row.put("joined_at", u.getCreatedAt());
            return row;
        }).toList();

        List<ReferralEarning> earnings = referralEarningRepo.findByReferrerIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> earningRows = earnings.stream().map(e -> {
            User referred = userRepo.findById(e.getReferredUserId()).orElse(null);
            Map<String, Object> row = new java.util.HashMap<>();
            row.put("id", e.getId());
            row.put("referred_user_name", referred != null ? referred.getFullName() : "Unknown");
            row.put("referred_user_email", referred != null ? referred.getEmail() : "");
            row.put("deposit_amount", e.getDepositAmount());
            row.put("commission_amount", e.getCommissionAmount());
            row.put("created_at", e.getCreatedAt());
            return row;
        }).toList();

        BigDecimal totalEarned = earnings.stream()
                .map(ReferralEarning::getCommissionAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "referred_users", referredRows,
                "earnings", earningRows,
                "total_earned", totalEarned
        )));
    }

    private String requireText(Object raw, String errorMessage) {
        String value = raw == null ? "" : raw.toString().trim();
        if (value.isEmpty()) {
            throw new BadRequestException(errorMessage);
        }
        return value;
    }

    // POST /api/portfolio/withdrawals — submits a request for admin review
    @PostMapping("/withdrawals")
    public ResponseEntity<ApiResponse<?>> requestWithdrawal(@RequestBody Map<String, Object> body, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        BigDecimal amount = toAmount(body.get("amount"));
        String bankName = requireText(body.get("bank_name"), "Select a bank or wallet");
        String accountTitle = requireText(body.get("account_title"), "Enter the account title");
        String accountNumber = requireText(body.get("account_number"), "Enter the account number or IBAN");

        Portfolio portfolio = portfolioRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        if (amount.compareTo(portfolio.getCashBalance()) > 0) {
            throw new BadRequestException("Amount exceeds your available cash balance");
        }

        WithdrawRequest request = new WithdrawRequest();
        request.setUserId(userId);
        request.setAmount(amount);
        request.setBankName(bankName);
        request.setAccountTitle(accountTitle);
        request.setAccountNumber(accountNumber);
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
