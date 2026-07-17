package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.AppSetting;
import com.goldtrade.backend.exception.BadRequestException;
import com.goldtrade.backend.repository.AppSettingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@RestController
public class SettingsController {

    private static final String DEPOSIT_WHATSAPP_KEY = "deposit_whatsapp_number";
    private static final String DEPOSIT_WHATSAPP_DEFAULT = "03001234567";

    private static final String JAZZCASH_NUMBER_KEY = "jazzcash_number";
    private static final String JAZZCASH_NUMBER_DEFAULT = "03001234567";
    private static final String BINANCE_ADDRESS_KEY = "binance_address";
    private static final String BINANCE_ADDRESS_DEFAULT = "TRGqwZ85XoV1xxqRk1fu6KbhyGX4rG5DnV";
    private static final String BINANCE_NETWORK_KEY = "binance_network";
    private static final String BINANCE_NETWORK_DEFAULT = "TRX (TRC20)";

    private static final String GOLD_PRICE_KEY = "gold_price_today";
    private static final String GOLD_PRICE_DEFAULT = "2650.00";

    private final AppSettingRepository settingRepo;

    public SettingsController(AppSettingRepository settingRepo) {
        this.settingRepo = settingRepo;
    }

    private String getSetting(String key, String fallback) {
        return settingRepo.findById(key).map(AppSetting::getValue).orElse(fallback);
    }

    private void putSetting(String key, String value) {
        AppSetting setting = settingRepo.findById(key).orElse(new AppSetting(key, value));
        setting.setValue(value);
        settingRepo.save(setting);
    }

    // GET /api/settings/deposit-whatsapp — any authenticated user (investor or admin)
    @GetMapping("/api/settings/deposit-whatsapp")
    public ResponseEntity<ApiResponse<?>> getDepositWhatsapp() {
        String number = getSetting(DEPOSIT_WHATSAPP_KEY, DEPOSIT_WHATSAPP_DEFAULT);
        return ResponseEntity.ok(ApiResponse.success(Map.of("whatsapp_number", number)));
    }

    // PUT /api/admin/settings/deposit-whatsapp — admin only
    @PutMapping("/api/admin/settings/deposit-whatsapp")
    public ResponseEntity<ApiResponse<?>> updateDepositWhatsapp(@RequestBody Map<String, String> body) {
        String number = body.getOrDefault("whatsapp_number", "").trim();
        if (number.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Enter a valid WhatsApp number"));
        }
        putSetting(DEPOSIT_WHATSAPP_KEY, number);
        return ResponseEntity.ok(ApiResponse.success(Map.of("whatsapp_number", number), "WhatsApp number updated"));
    }

    // GET /api/settings/payment-methods — any authenticated user; shown on the deposit page
    @GetMapping("/api/settings/payment-methods")
    public ResponseEntity<ApiResponse<?>> getPaymentMethods() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "jazzcash_number", getSetting(JAZZCASH_NUMBER_KEY, JAZZCASH_NUMBER_DEFAULT),
                "binance_address", getSetting(BINANCE_ADDRESS_KEY, BINANCE_ADDRESS_DEFAULT),
                "binance_network", getSetting(BINANCE_NETWORK_KEY, BINANCE_NETWORK_DEFAULT)
        )));
    }

    // PUT /api/admin/settings/payment-methods — admin only
    @PutMapping("/api/admin/settings/payment-methods")
    public ResponseEntity<ApiResponse<?>> updatePaymentMethods(@RequestBody Map<String, String> body) {
        String jazzcash = body.getOrDefault("jazzcash_number", "").trim();
        String address = body.getOrDefault("binance_address", "").trim();
        String network = body.getOrDefault("binance_network", "").trim();
        if (jazzcash.isEmpty()) {
            throw new BadRequestException("Enter a valid JazzCash number");
        }
        if (address.isEmpty()) {
            throw new BadRequestException("Enter a valid Binance address");
        }
        if (network.isEmpty()) {
            throw new BadRequestException("Enter a valid network label");
        }
        putSetting(JAZZCASH_NUMBER_KEY, jazzcash);
        putSetting(BINANCE_ADDRESS_KEY, address);
        putSetting(BINANCE_NETWORK_KEY, network);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "jazzcash_number", jazzcash,
                "binance_address", address,
                "binance_network", network
        ), "Payment methods updated"));
    }

    // GET /api/settings/gold-price — any authenticated user; anchors the dashboard gold chart
    @GetMapping("/api/settings/gold-price")
    public ResponseEntity<ApiResponse<?>> getGoldPrice() {
        BigDecimal price = new BigDecimal(getSetting(GOLD_PRICE_KEY, GOLD_PRICE_DEFAULT));
        return ResponseEntity.ok(ApiResponse.success(Map.of("price", price)));
    }

    // PUT /api/admin/settings/gold-price — admin only
    @PutMapping("/api/admin/settings/gold-price")
    public ResponseEntity<ApiResponse<?>> updateGoldPrice(@RequestBody Map<String, Object> body) {
        BigDecimal price = toPositiveAmount(body.get("price"));
        putSetting(GOLD_PRICE_KEY, price.toPlainString());
        return ResponseEntity.ok(ApiResponse.success(Map.of("price", price), "Gold price updated"));
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
