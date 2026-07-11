package com.goldtrade.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "deposit_requests")
@Data
@NoArgsConstructor
public class DepositRequest {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "account_title", nullable = false)
    private String accountTitle;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;

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
