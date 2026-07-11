package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.User;
import com.goldtrade.backend.repository.HoldingRepository;
import com.goldtrade.backend.repository.PortfolioRepository;
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

    private final UserRepository userRepo;
    private final PortfolioRepository portfolioRepo;
    private final HoldingRepository holdingRepo;

    public AdminOverviewController(UserRepository userRepo,
                                    PortfolioRepository portfolioRepo,
                                    HoldingRepository holdingRepo) {
        this.userRepo = userRepo;
        this.portfolioRepo = portfolioRepo;
        this.holdingRepo = holdingRepo;
    }

    // GET /api/admin/overview — platform-wide stats
    @GetMapping
    public ResponseEntity<ApiResponse<?>> overview() {
        List<User> customers = userRepo.findAll();
        long approvedCount = customers.stream().filter(u -> Boolean.TRUE.equals(u.getIsApproved())).count();
        long pendingCount = customers.stream()
                .filter(u -> Boolean.TRUE.equals(u.getEmailVerified()) && !Boolean.TRUE.equals(u.getIsApproved()))
                .count();

        BigDecimal totalAum = BigDecimal.ZERO;
        for (User customer : customers) {
            Portfolio portfolio = portfolioRepo.findByUserId(customer.getId()).orElse(null);
            if (portfolio == null) continue;
            BigDecimal holdingsValue = holdingRepo.findByPortfolioId(portfolio.getId()).stream()
                    .map(h -> h.getCurrentPrice().multiply(h.getQuantity()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totalAum = totalAum.add(holdingsValue).add(portfolio.getCashBalance());
        }

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "total_investors", customers.size(),
                "approved_investors", approvedCount,
                "pending_approvals", pendingCount,
                "total_aum", totalAum
        )));
    }
}
