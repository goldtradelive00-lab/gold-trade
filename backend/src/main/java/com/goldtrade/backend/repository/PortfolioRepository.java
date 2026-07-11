package com.goldtrade.backend.repository;

import com.goldtrade.backend.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, String> {
    Optional<Portfolio> findByUserId(String userId);
}
