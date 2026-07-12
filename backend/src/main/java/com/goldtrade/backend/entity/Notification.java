package com.goldtrade.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "recipient_id", nullable = false)
    private String recipientId;

    @Column(name = "recipient_role", nullable = false)
    private String recipientRole; // "investor" | "admin"

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "link")
    private String link;

    // Groups notifications so a whole category can be marked read at once when the
    // recipient visits the relevant page (e.g. "deposit", "withdraw", "referral").
    @Column(name = "section", nullable = false)
    private String section;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public Notification(String recipientId, String recipientRole, String type, String title,
                         String message, String link, String section) {
        this.recipientId = recipientId;
        this.recipientRole = recipientRole;
        this.type = type;
        this.title = title;
        this.message = message;
        this.link = link;
        this.section = section;
    }
}
