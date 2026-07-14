package com.goldtrade.backend.service;

import com.goldtrade.backend.entity.RefreshToken;
import com.goldtrade.backend.exception.BadRequestException;
import com.goldtrade.backend.repository.RefreshTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.logging.Logger;

// Issues, validates, and rotates refresh tokens. The raw token is handed to the
// client once and never persisted — only its SHA-256 hash lives in the database,
// so a stolen DB backup can't be replayed as a live session. Each successful
// refresh revokes the old token and issues a new one (rotation), so a refresh
// token can only ever be used once; reuse of an already-rotated token is a
// strong signal of theft.
@Service
public class RefreshTokenService {

    private static final Logger log = Logger.getLogger(RefreshTokenService.class.getName());
    private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(30);
    // Revoked tokens are kept this long before purging so a reused (already-rotated) token
    // still surfaces as a revoked row rather than a bare "not found".
    private static final Duration REVOKED_RETENTION = Duration.ofDays(7);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository repo;

    public RefreshTokenService(RefreshTokenRepository repo) {
        this.repo = repo;
    }

    // Purge expired and long-since-revoked rows daily so the table doesn't grow unbounded.
    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void purgeDeadTokens() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        int deleted = repo.deleteDeadTokens(now, now.minus(REVOKED_RETENTION));
        if (deleted > 0) {
            log.info("Refresh-token purge: deleted " + deleted + " dead rows");
        }
    }

    public record IssuedToken(String rawToken, String tokenId) {}

    public IssuedToken issueForUser(String userId) {
        return issue(userId, null);
    }

    public IssuedToken issueForAdmin(String adminId) {
        return issue(null, adminId);
    }

    private IssuedToken issue(String userId, String adminId) {
        String rawToken = generateRawToken();
        RefreshToken entity = new RefreshToken();
        entity.setUserId(userId);
        entity.setAdminId(adminId);
        entity.setTokenHash(hash(rawToken));
        entity.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).plus(REFRESH_TOKEN_TTL));
        entity.setRevoked(false);
        repo.save(entity);
        return new IssuedToken(rawToken, entity.getId());
    }

    public record RotatedToken(String rawToken, String userId, String adminId) {}

    /** Validates the refresh token, revokes it, and issues a replacement (rotation). */
    public RotatedToken rotate(String rawToken) {
        RefreshToken existing = repo.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new BadRequestException("Invalid or expired refresh token"));

        if (Boolean.TRUE.equals(existing.getRevoked())
                || existing.getExpiresAt().isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        existing.setRevoked(true);
        repo.save(existing);

        IssuedToken next = issue(existing.getUserId(), existing.getAdminId());
        return new RotatedToken(next.rawToken(), existing.getUserId(), existing.getAdminId());
    }

    /** Best-effort revoke on logout; silently no-ops if the token is already gone/invalid. */
    public void revoke(String rawToken) {
        repo.findByTokenHash(hash(rawToken)).ifPresent(t -> {
            t.setRevoked(true);
            repo.save(t);
        });
    }

    /** Kills every outstanding session for this account (e.g. on password change/reset). */
    public void revokeAllForUser(String userId) {
        repo.revokeAllForUser(userId);
    }

    /** Kills every outstanding session for this admin (e.g. on password change/reset). */
    public void revokeAllForAdmin(String adminId) {
        repo.revokeAllForAdmin(adminId);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[48];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
