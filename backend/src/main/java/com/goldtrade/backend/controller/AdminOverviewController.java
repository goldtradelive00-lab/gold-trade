package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.Treasury;
import com.goldtrade.backend.entity.User;
import com.goldtrade.backend.repository.PortfolioRepository;
import com.goldtrade.backend.repository.TreasuryRepository;
import com.goldtrade.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/overview")
public class AdminOverviewController {

    private static final String TREASURY_ID = "main";

    private final UserRepository userRepo;
    private final PortfolioRepository portfolioRepo;
    private final TreasuryRepository treasuryRepo;

    public AdminOverviewController(UserRepository userRepo, PortfolioRepository portfolioRepo, TreasuryRepository treasuryRepo) {
        this.userRepo = userRepo;
        this.portfolioRepo = portfolioRepo;
        this.treasuryRepo = treasuryRepo;
    }

    // GET /api/admin/overview — platform-wide stats
    @GetMapping
    public ResponseEntity<ApiResponse<?>> overview() {
        List<User> customers = userRepo.findAll();
        long approvedCount = customers.stream().filter(u -> Boolean.TRUE.equals(u.getIsApproved())).count();
        long pendingCount = customers.stream()
                .filter(u -> Boolean.TRUE.equals(u.getEmailVerified()) && !Boolean.TRUE.equals(u.getIsApproved()))
                .count();

        BigDecimal totalAum = portfolioRepo.findAll().stream()
                .map(Portfolio::getCashBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal treasuryBalance = treasuryRepo.findById(TREASURY_ID)
                .map(Treasury::getBalance)
                .orElse(BigDecimal.ZERO);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "total_investors", customers.size(),
                "approved_investors", approvedCount,
                "pending_approvals", pendingCount,
                "total_aum", totalAum,
                "treasury_balance", treasuryBalance
        )));
    }
}
