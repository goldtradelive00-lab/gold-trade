package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.Transaction;
import com.goldtrade.backend.entity.Treasury;
import com.goldtrade.backend.entity.User;
import com.goldtrade.backend.exception.BadRequestException;
import com.goldtrade.backend.exception.ResourceNotFoundException;
import com.goldtrade.backend.repository.PortfolioRepository;
import com.goldtrade.backend.repository.TransactionRepository;
import com.goldtrade.backend.repository.TreasuryRepository;
import com.goldtrade.backend.repository.UserRepository;
import com.goldtrade.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

// Lets an admin manually move funds from the platform treasury into an investor's
// cash balance, outside the normal deposit-request-approval flow.
@RestController
@RequestMapping("/api/admin/treasury")
public class AdminTreasuryController {

    private static final String TREASURY_ID = "main";

    private final TreasuryRepository treasuryRepo;
    private final PortfolioRepository portfolioRepo;
    private final TransactionRepository transactionRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    public AdminTreasuryController(TreasuryRepository treasuryRepo,
                                    PortfolioRepository portfolioRepo,
                                    TransactionRepository transactionRepo,
                                    UserRepository userRepo,
                                    NotificationService notificationService) {
        this.treasuryRepo = treasuryRepo;
        this.portfolioRepo = portfolioRepo;
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
    }

    // GET /api/admin/treasury — current treasury balance
    @GetMapping
    public ResponseEntity<ApiResponse<?>> get() {
        Treasury treasury = treasuryRepo.findById(TREASURY_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Treasury not found"));
        return ResponseEntity.ok(ApiResponse.success(Map.of("balance", treasury.getBalance())));
    }

    // POST /api/admin/treasury/transfer — moves funds from the treasury into an investor's
    // cash + principal balance (behaves like a manually-credited deposit)
    @Transactional
    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<?>> transfer(@RequestBody Map<String, Object> body) {
        String investorId = (String) body.get("investor_id");
        if (investorId == null || investorId.isBlank()) {
            throw new BadRequestException("Select an investor");
        }
        BigDecimal amount = toAmount(body.get("amount"));

        Treasury treasury = treasuryRepo.findById(TREASURY_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Treasury not found"));
        if (amount.compareTo(treasury.getBalance()) > 0) {
            throw new BadRequestException("Amount exceeds the treasury balance");
        }

        User investor = userRepo.findById(investorId)
                .orElseThrow(() -> new ResourceNotFoundException("Investor not found"));
        Portfolio portfolio = portfolioRepo.findByUserId(investorId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        treasury.setBalance(treasury.getBalance().subtract(amount));
        treasuryRepo.save(treasury);

        portfolio.setCashBalance(portfolio.getCashBalance().add(amount));
        portfolio.setPrincipalBalance(portfolio.getPrincipalBalance().add(amount));
        portfolioRepo.save(portfolio);

        Transaction tx = new Transaction();
        tx.setPortfolioId(portfolio.getId());
        tx.setType("admin_credit");
        tx.setDescription("Manual credit from GoldTrade admin");
        tx.setAmount(amount);
        transactionRepo.save(tx);

        notificationService.notifyInvestor(
                investorId,
                "admin_credit",
                "Account credited",
                formatAmount(amount) + " was credited to your account by GoldTrade.",
                "/investor/dashboard",
                "dashboard"
        );

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("balance", treasury.getBalance()),
                formatAmount(amount) + " transferred to " + (investor.getFullName() != null ? investor.getFullName() : investor.getEmail())));
    }

    private String formatAmount(BigDecimal amount) {
        return "Rs " + amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private BigDecimal toAmount(Object raw) {
        BigDecimal amount;
        if (raw instanceof Number n) {
            amount = BigDecimal.valueOf(n.doubleValue());
        } else if (raw instanceof String s) {
            try {
                amount = new BigDecimal(s);
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
        // Upper magnitude is already bounded by the treasury-balance check in transfer().
        return amount;
    }
}
