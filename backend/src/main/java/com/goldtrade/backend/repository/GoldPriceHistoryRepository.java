package com.goldtrade.backend.repository;

import com.goldtrade.backend.entity.GoldPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoldPriceHistoryRepository extends JpaRepository<GoldPriceHistory, LocalDate> {
    List<GoldPriceHistory> findByPriceDateBetweenOrderByPriceDateAsc(LocalDate start, LocalDate end);
}
