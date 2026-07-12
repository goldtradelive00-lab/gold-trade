package com.goldtrade.backend.repository;

import com.goldtrade.backend.entity.Treasury;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TreasuryRepository extends JpaRepository<Treasury, String> {
}
