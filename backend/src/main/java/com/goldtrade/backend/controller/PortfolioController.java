package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.DepositRequest;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.ReferralEarning;
import com.goldtrade.backend.entity.Transaction;
import com.goldtrade.backend.entity.User;
import com.goldtrade.backend.entity.WithdrawRequest;
import com.goldtrade.backend.exception.BadRequestException;
import com.goldtrade.backend.exception.ResourceNotFoundException;
import com.goldtrade.backend.repository.DepositRequestRepository;
import com.goldtrade.backend.repository.PortfolioRepository;
import com.goldtrade.backend.repository.ReferralEarningRepository;
import com.goldtrade.backend.repository.TransactionRepository;
import com.goldtrade.backend.repository.UserRepository;
import com.goldtrade.backend.repository.WithdrawRequestRepository;
import com.goldtrade.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioRepository portfolioRepo;
    private final TransactionRepository transactionRepo;
    private final WithdrawRequestRepository withdrawRequestRepo;
    private final DepositRequestRepository depositRequestRepo;
    private final UserRepository userRepo;
    private final ReferralEarningRepository referralEarningRepo;
    private final NotificationService notificationService;

    public PortfolioController(PortfolioRepository portfolioRepo,
                                TransactionRepository transactionRepo,
                                WithdrawRequestRepository withdrawRequestRepo,
                                DepositRequestRepository depositRequestRepo,
                                UserRepository userRepo,
                                ReferralEarningRepository referralEarningRepo,
                                NotificationService notificationService) {
        this.portfolioRepo = portfolioRepo;
        this.transactionRepo = transactionRepo;
        this.withdrawRequestRepo = withdrawRequestRepo;
        this.depositRequestRepo = depositRequestRepo;
        this.userRepo = userRepo;
        this.referralEarningRepo = referralEarningRepo;
        this.notificationService = notificationService;
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
    // investor has paid via JazzCash or Binance and sent a receipt via WhatsApp; the amount
    // is set by the admin from the receipt at approval time, not by the investor here
    @PostMapping("/deposit-requests")
    public ResponseEntity<ApiResponse<?>> requestDeposit(@RequestBody Map<String, Object> body, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        String paymentMethod = requireText(body.get("payment_method"), "Select a payment method");
        if (!"jazzcash".equals(paymentMethod) && !"binance".equals(paymentMethod)) {
            throw new BadRequestException("Select a valid payment method");
        }
        String transactionReference = body.get("transaction_reference") == null
                ? null : body.get("transaction_reference").toString().trim();
        if (transactionReference != null && transactionReference.isEmpty()) transactionReference = null;

        DepositRequest request = new DepositRequest();
        request.setUserId(userId);
        request.setPaymentMethod(paymentMethod);
        request.setTransactionReference(transactionReference);
        request.setStatus("pending");
        depositRequestRepo.save(request);

        User investor = userRepo.findById(userId).orElse(null);
        notificationService.notifyAllAdmins(
                "new_deposit_request",
                "New deposit request",
                (investor != null ? investor.getFullName() : "An investor") + " submitted a deposit request via "
                        + ("binance".equals(paymentMethod) ? "Binance USDT" : "JazzCash") + ".",
                "/admin/deposit-requests",
                "admin_deposit"
        );

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

    // POST /api/portfolio/withdrawals — submits a request for admin review. Payout method is
    // bank_transfer, jazzcash, or binance; each needs different destination details.
    @PostMapping("/withdrawals")
    public ResponseEntity<ApiResponse<?>> requestWithdrawal(@RequestBody Map<String, Object> body, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        BigDecimal amount = toAmount(body.get("amount"));
        String method = requireText(body.get("method"), "Select a payout method");
        if (!method.equals("bank_transfer") && !method.equals("jazzcash") && !method.equals("binance")) {
            throw new BadRequestException("Select a valid payout method");
        }

        Portfolio portfolio = portfolioRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        if (amount.compareTo(portfolio.getCashBalance()) > 0) {
            throw new BadRequestException("Amount exceeds your available cash balance");
        }

        WithdrawRequest request = new WithdrawRequest();
        request.setUserId(userId);
        request.setAmount(amount);
        request.setMethod(method);

        if (method.equals("bank_transfer")) {
            request.setBankName(requireText(body.get("bank_name"), "Select a bank or wallet"));
            request.setAccountTitle(requireText(body.get("account_title"), "Enter the account title"));
            request.setAccountNumber(requireText(body.get("account_number"), "Enter the account number or IBAN"));
        } else if (method.equals("jazzcash")) {
            request.setBankName("JazzCash");
            request.setAccountNumber(requireText(body.get("account_number"), "Enter your JazzCash number"));
        } else {
            request.setBankName("Binance USDT");
            request.setAccountNumber(requireText(body.get("account_number"), "Enter your Binance address"));
        }

        request.setStatus("pending");
        withdrawRequestRepo.save(request);

        User investor = userRepo.findById(userId).orElse(null);
        notificationService.notifyAllAdmins(
                "new_withdrawal_request",
                "New withdrawal request",
                (investor != null ? investor.getFullName() : "An investor") + " requested a withdrawal of " + formatAmount(amount) + ".",
                "/admin/withdrawals",
                "admin_withdraw"
        );

        return ResponseEntity.ok(ApiResponse.success(null, "Withdrawal request submitted for review"));
    }

    private String formatAmount(BigDecimal amount) {
        return "$" + amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    // Sanity ceiling on a single deposit/withdrawal request. Generous, but blocks absurd or
    // fat-fingered values (e.g. overflow attempts) from ever entering the money flow.
    private static final BigDecimal MAX_AMOUNT = new BigDecimal("1000000"); // 1 million USD

    private BigDecimal toAmount(Object raw) {
        BigDecimal amount;
        if (raw instanceof Number n) {
            amount = BigDecimal.valueOf(n.doubleValue());
        } else if (raw instanceof String s) {
            try {
                amount = new BigDecimal(s.trim());
            } catch (NumberFormatException e) {
                throw new BadRequestException("Enter a valid amount");
            }
        } else {
            amount = BigDecimal.ZERO;
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Enter a valid amount");
        }
        if (amount.stripTrailingZeros().scale() > 2) {
            throw new BadRequestException("Amount can have at most 2 decimal places");
        }
        if (amount.compareTo(MAX_AMOUNT) > 0) {
            throw new BadRequestException("Amount exceeds the maximum allowed per request");
        }
        return amount;
    }
}
