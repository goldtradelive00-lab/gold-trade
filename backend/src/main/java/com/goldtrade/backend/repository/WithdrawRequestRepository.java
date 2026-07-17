package com.goldtrade.backend.repository;

import com.goldtrade.backend.entity.WithdrawRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawRequestRepository extends JpaRepository<WithdrawRequest, String> {
    List<WithdrawRequest> findByUserIdOrderByRequestedAtDesc(String userId);
    List<WithdrawRequest> findAllByOrderByRequestedAtDesc();
    long countByStatus(String status);
}
