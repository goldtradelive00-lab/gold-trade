package com.goldtrade.backend.repository;

import com.goldtrade.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByVerificationToken(String verificationToken);
    Optional<User> findByReferralCode(String referralCode);
    List<User> findByIsApproved(Boolean isApproved);
    List<User> findByReferredByOrderByCreatedAtDesc(String referredBy);
}
