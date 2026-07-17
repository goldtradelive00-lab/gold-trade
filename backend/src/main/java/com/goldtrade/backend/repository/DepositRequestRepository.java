package com.goldtrade.backend.repository;

import com.goldtrade.backend.entity.DepositRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepositRequestRepository extends JpaRepository<DepositRequest, String> {
    List<DepositRequest> findByUserIdOrderByRequestedAtDesc(String userId);
    List<DepositRequest> findAllByOrderByRequestedAtDesc();
    long countByStatus(String status);
}
