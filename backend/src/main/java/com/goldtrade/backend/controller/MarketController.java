package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.GoldPriceHistory;
import com.goldtrade.backend.service.GoldPriceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final GoldPriceService goldPriceService;

    public MarketController(GoldPriceService goldPriceService) {
        this.goldPriceService = goldPriceService;
    }

    // GET /api/market/gold — live XAU/PKR spot price (cached server-side to conserve API quota)
    @GetMapping("/gold")
    public ResponseEntity<ApiResponse<?>> getGoldPrice() {
        GoldPriceService.GoldPrice price = goldPriceService.getPrice();
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "price_per_tola", price.pricePerTola(),
                "price_per_gram_24k", price.pricePerGram24k(),
                "fetched_at", price.fetchedAt().toString(),
                "live", price.live()
        )));
    }

    // GET /api/market/gold/history — daily gold price history (backfilled and cached in Postgres)
    @GetMapping("/gold/history")
    public ResponseEntity<ApiResponse<?>> getGoldHistory(@RequestParam(defaultValue = "30") int days) {
        List<GoldPriceHistory> history = goldPriceService.getDailyHistory(Math.min(Math.max(days, 1), 90));
        List<Map<String, Object>> data = history.stream().map(h -> Map.<String, Object>of(
                "date", h.getPriceDate().toString(),
                "price_per_tola", h.getPricePerTola(),
                "price_per_gram_24k", h.getPricePerGram24k()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
