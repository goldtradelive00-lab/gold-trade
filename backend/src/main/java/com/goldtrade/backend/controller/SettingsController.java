package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.AppSetting;
import com.goldtrade.backend.repository.AppSettingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class SettingsController {

    private static final String DEPOSIT_WHATSAPP_KEY = "deposit_whatsapp_number";
    private static final String DEPOSIT_WHATSAPP_DEFAULT = "03001234567";

    private final AppSettingRepository settingRepo;

    public SettingsController(AppSettingRepository settingRepo) {
        this.settingRepo = settingRepo;
    }

    // GET /api/settings/deposit-whatsapp — any authenticated user (investor or admin)
    @GetMapping("/api/settings/deposit-whatsapp")
    public ResponseEntity<ApiResponse<?>> getDepositWhatsapp() {
        String number = settingRepo.findById(DEPOSIT_WHATSAPP_KEY)
                .map(AppSetting::getValue)
                .orElse(DEPOSIT_WHATSAPP_DEFAULT);
        return ResponseEntity.ok(ApiResponse.success(Map.of("whatsapp_number", number)));
    }

    // PUT /api/admin/settings/deposit-whatsapp — admin only
    @PutMapping("/api/admin/settings/deposit-whatsapp")
    public ResponseEntity<ApiResponse<?>> updateDepositWhatsapp(@RequestBody Map<String, String> body) {
        String number = body.getOrDefault("whatsapp_number", "").trim();
        if (number.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Enter a valid WhatsApp number"));
        }
        AppSetting setting = settingRepo.findById(DEPOSIT_WHATSAPP_KEY)
                .orElse(new AppSetting(DEPOSIT_WHATSAPP_KEY, number));
        setting.setValue(number);
        settingRepo.save(setting);
        return ResponseEntity.ok(ApiResponse.success(Map.of("whatsapp_number", number), "WhatsApp number updated"));
    }
}
