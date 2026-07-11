package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.Holding;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.exception.ResourceNotFoundException;
import com.goldtrade.backend.repository.HoldingRepository;
import com.goldtrade.backend.repository.PortfolioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/holdings")
public class HoldingController {

    private final HoldingRepository holdingRepo;
    private final PortfolioRepository portfolioRepo;

    public HoldingController(HoldingRepository holdingRepo, PortfolioRepository portfolioRepo) {
        this.holdingRepo = holdingRepo;
        this.portfolioRepo = portfolioRepo;
    }

    // GET /api/holdings/{id} — detail view, owner or admin only
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getHolding(@PathVariable String id, Authentication auth) {
        Holding holding = holdingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holding not found"));

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            String userId = (String) auth.getPrincipal();
            Portfolio portfolio = portfolioRepo.findById(holding.getPortfolioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
            if (!portfolio.getUserId().equals(userId)) {
                throw new AccessDeniedException("This holding does not belong to your portfolio");
            }
        }

        return ResponseEntity.ok(ApiResponse.success(holding));
    }
}
