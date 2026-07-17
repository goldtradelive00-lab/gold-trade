package com.goldtrade.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "verification_token_expires")
    private OffsetDateTime verificationTokenExpires;

    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = false;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "kyc_status", nullable = false)
    private String kycStatus = "pending";

    @Column(name = "referral_code", unique = true)
    private String referralCode;

    // Assigned by a DB sequence on insert (see migration) — stable, sequential, and never
    // reused, so it's a safe human-facing identifier distinct from the internal UUID.
    @Column(name = "goldtrade_seq", insertable = false, updatable = false)
    private Integer goldtradeSeq;

    @Column(name = "referred_by")
    private String referredBy;

    @Column(name = "status", nullable = false)
    private String status = "active";

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public String getGoldtradeId() {
        return goldtradeSeq != null ? String.format("GT-%05d", goldtradeSeq) : null;
    }
}
