package com.goldtrade.backend.repository;

import com.goldtrade.backend.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("update RefreshToken r set r.revoked = true where r.userId = :userId and r.revoked = false")
    void revokeAllForUser(@Param("userId") String userId);

    @Modifying
    @Query("update RefreshToken r set r.revoked = true where r.adminId = :adminId and r.revoked = false")
    void revokeAllForAdmin(@Param("adminId") String adminId);
}
