package com.goldtrade.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

// Singleton row (id = "main") holding the platform's transferable treasury balance,
// used to manually fund investor accounts outside the normal deposit-approval flow.
@Entity
@Table(name = "treasury")
@Data
@NoArgsConstructor
public class Treasury {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "balance", nullable = false)
    private BigDecimal balance;

    // Optimistic lock: two concurrent transfers can't both debit the treasury off the same
    // stale balance — the losing one fails with ObjectOptimisticLockingFailureException → 409.
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = OffsetDateTime.now();
    }
}
