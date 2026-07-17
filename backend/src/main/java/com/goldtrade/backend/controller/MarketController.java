package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.GoldPriceHistory;
import com.goldtrade.backend.exception.BadRequestException;
import com.goldtrade.backend.service.GoldPriceHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@RestController
public class MarketController {

    private final GoldPriceHistoryService goldPriceService;

    public MarketController(GoldPriceHistoryService goldPriceService) {
        this.goldPriceService = goldPriceService;
    }

    // GET /api/market/gold — today's stored gold price (public; powers the landing page and
    // investor dashboard charts)
    @GetMapping("/api/market/gold")
    public ResponseEntity<ApiResponse<?>> getGold() {
        GoldPriceHistory today = goldPriceService.getTodayPrice();
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "price", today.getPrice(),
                "date", today.getPriceDate().toString()
        )));
    }

    // GET /api/market/gold/history?days=30 — stored daily history (public)
    @GetMapping("/api/market/gold/history")
    public ResponseEntity<ApiResponse<?>> getGoldHistory(@RequestParam(defaultValue = "30") int days) {
        List<Map<String, Object>> rows = goldPriceService.getHistory(days).stream()
                .map(h -> Map.<String, Object>of("date", h.getPriceDate().toString(), "price", h.getPrice()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(rows));
    }

    // PUT /api/admin/market/gold — admin sets today's gold price
    @PutMapping("/api/admin/market/gold")
    public ResponseEntity<ApiResponse<?>> setGold(@RequestBody Map<String, Object> body) {
        BigDecimal price = toPositiveAmount(body.get("price"));
        GoldPriceHistory today = goldPriceService.setTodayPrice(price);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("price", today.getPrice(), "date", today.getPriceDate().toString()),
                "Gold price updated"));
    }

    private BigDecimal toPositiveAmount(Object raw) {
        BigDecimal amount;
        if (raw instanceof Number n) {
            amount = BigDecimal.valueOf(n.doubleValue());
        } else if (raw instanceof String s) {
            try {
                amount = new BigDecimal(s.trim());
            } catch (NumberFormatException e) {
                throw new BadRequestException("Enter a valid price");
            }
        } else {
            throw new BadRequestException("Enter a valid price");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Enter a valid price");
        }
        return amount.setScale(2, RoundingMode.HALF_UP);
    }
}
