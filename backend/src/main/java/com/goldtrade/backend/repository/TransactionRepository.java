package com.goldtrade.backend.repository;

import com.goldtrade.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByPortfolioIdOrderByOccurredAtDesc(String portfolioId);
    List<Transaction> findAllByOrderByOccurredAtDesc();
}
