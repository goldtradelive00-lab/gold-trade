package com.goldtrade.backend.repository;

import com.goldtrade.backend.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, String> {
    List<Holding> findByPortfolioId(String portfolioId);
}
