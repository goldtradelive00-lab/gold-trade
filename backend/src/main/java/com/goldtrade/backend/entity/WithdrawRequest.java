package com.goldtrade.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "withdraw_requests")
@Data
@NoArgsConstructor
public class WithdrawRequest {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "method", nullable = false)
    private String method = "bank_transfer";

    @Column(name = "status", nullable = false)
    private String status = "pending";

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    @Column(name = "requested_at")
    private OffsetDateTime requestedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (requestedAt == null) requestedAt = OffsetDateTime.now();
    }
}
