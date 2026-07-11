package com.goldtrade.backend.repository;

import com.goldtrade.backend.entity.ReferralEarning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferralEarningRepository extends JpaRepository<ReferralEarning, String> {
    List<ReferralEarning> findByReferrerIdOrderByCreatedAtDesc(String referrerId);
}
