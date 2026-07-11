package com.goldtrade.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "gold_price_history")
@Data
@NoArgsConstructor
public class GoldPriceHistory {

    @Id
    @Column(name = "price_date")
    private LocalDate priceDate;

    @Column(name = "price_per_tola", nullable = false)
    private BigDecimal pricePerTola;

    @Column(name = "price_per_gram_24k", nullable = false)
    private BigDecimal pricePerGram24k;

    @Column(name = "fetched_at")
    private OffsetDateTime fetchedAt;

    public GoldPriceHistory(LocalDate priceDate, BigDecimal pricePerTola, BigDecimal pricePerGram24k) {
        this.priceDate = priceDate;
        this.pricePerTola = pricePerTola;
        this.pricePerGram24k = pricePerGram24k;
        this.fetchedAt = OffsetDateTime.now();
    }
}
