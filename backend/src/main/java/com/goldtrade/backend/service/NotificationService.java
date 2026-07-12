package com.goldtrade.backend.service;

import com.goldtrade.backend.entity.Admin;
import com.goldtrade.backend.entity.Notification;
import com.goldtrade.backend.repository.AdminRepository;
import com.goldtrade.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final AdminRepository adminRepo;

    public NotificationService(NotificationRepository notificationRepo, AdminRepository adminRepo) {
        this.notificationRepo = notificationRepo;
        this.adminRepo = adminRepo;
    }

    public void notifyInvestor(String userId, String type, String title, String message, String link, String section) {
        notificationRepo.save(new Notification(userId, "investor", type, title, message, link, section));
    }

    // Fans out to every admin — the admin team is small, so this is a simple broadcast
    // rather than a per-admin subscription/assignment system.
    public void notifyAllAdmins(String type, String title, String message, String link, String section) {
        for (Admin admin : adminRepo.findAll()) {
            notificationRepo.save(new Notification(admin.getId(), "admin", type, title, message, link, section));
        }
    }
}
