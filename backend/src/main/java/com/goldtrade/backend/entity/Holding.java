package com.goldtrade.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "holdings")
@Data
@NoArgsConstructor
public class Holding {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "portfolio_id", nullable = false)
    private String portfolioId;

    @Column(name = "symbol", nullable = false)
    private String symbol;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "asset_type", nullable = false)
    private String assetType = "equity";

    @Column(name = "quantity", nullable = false)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "avg_cost", nullable = false)
    private BigDecimal avgCost = BigDecimal.ZERO;

    @Column(name = "current_price", nullable = false)
    private BigDecimal currentPrice = BigDecimal.ZERO;

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
}
