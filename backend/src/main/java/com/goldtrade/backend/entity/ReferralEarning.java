package com.goldtrade.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "referral_earnings")
@Data
@NoArgsConstructor
public class ReferralEarning {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "referrer_id", nullable = false)
    private String referrerId;

    @Column(name = "referred_user_id", nullable = false)
    private String referredUserId;

    @Column(name = "deposit_request_id", nullable = false)
    private String depositRequestId;

    @Column(name = "deposit_amount", nullable = false)
    private BigDecimal depositAmount;

    @Column(name = "commission_amount", nullable = false)
    private BigDecimal commissionAmount;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }
}
