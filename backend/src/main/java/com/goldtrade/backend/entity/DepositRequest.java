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

    // Null until an admin verifies the WhatsApp receipt and sets it during approval.
    @Column(name = "amount")
    private BigDecimal amount;

    // Legacy fields from the old bank-transfer flow; left in place for historical rows,
    // no longer populated by new requests.
    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_title")
    private String accountTitle;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "sender_whatsapp")
    private String senderWhatsapp;

    @Column(name = "admin_whatsapp_number")
    private String adminWhatsappNumber;

    // "jazzcash" or "binance"
    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "transaction_reference")
    private String transactionReference;

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
