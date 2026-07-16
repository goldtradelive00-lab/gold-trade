package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.Notification;
import com.goldtrade.backend.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepo;

    public NotificationController(NotificationRepository notificationRepo) {
        this.notificationRepo = notificationRepo;
    }

    // GET /api/notifications — current user's notifications, newest first
    @GetMapping
    public ResponseEntity<ApiResponse<?>> list(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        List<Notification> notifications = notificationRepo.findByRecipientIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    // GET /api/notifications/unread-count
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<?>> unreadCount(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        long count = notificationRepo.countByRecipientIdAndIsReadFalse(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    // POST /api/notifications/mark-read-section — marks every notification in a section read,
    // called when the recipient visits the page that section covers
    @PostMapping("/mark-read-section")
    @Transactional
    public ResponseEntity<ApiResponse<?>> markSectionRead(@RequestBody Map<String, String> body, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        String section = body.get("section");
        if (section != null && !section.isBlank()) {
            notificationRepo.markSectionRead(userId, section);
        }
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // POST /api/notifications/mark-all-read — marks every notification read, called when the
    // recipient opens the notification bell dropdown
    @PostMapping("/mark-all-read")
    @Transactional
    public ResponseEntity<ApiResponse<?>> markAllRead(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        notificationRepo.markAllRead(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // DELETE /api/notifications — clears every notification for the current user
    @DeleteMapping
    @Transactional
    public ResponseEntity<ApiResponse<?>> clearAll(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        notificationRepo.deleteByRecipientId(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
