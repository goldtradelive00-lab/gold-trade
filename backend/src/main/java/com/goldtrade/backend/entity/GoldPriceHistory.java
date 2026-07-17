package com.goldtrade.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

// One row per calendar day (USD per troy ounce, 24K). Today's row is either set explicitly
// by an admin or auto-generated on first read of the day; once written, a day's price is
// stable — the landing page and dashboard charts read this table directly rather than
// regenerating anything client-side.
@Entity
@Table(name = "gold_price_history")
@Data
@NoArgsConstructor
public class GoldPriceHistory {

    @Id
    @Column(name = "price_date")
    private LocalDate priceDate;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public GoldPriceHistory(LocalDate priceDate, BigDecimal price) {
        this.priceDate = priceDate;
        this.price = price;
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = OffsetDateTime.now();
    }
}
