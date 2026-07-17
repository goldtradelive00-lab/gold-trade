package com.goldtrade.backend.controller;

import com.goldtrade.backend.dto.response.ApiResponse;
import com.goldtrade.backend.entity.Admin;
import com.goldtrade.backend.entity.PasswordResetToken;
import com.goldtrade.backend.entity.Portfolio;
import com.goldtrade.backend.entity.User;
import com.goldtrade.backend.exception.BadRequestException;
import com.goldtrade.backend.exception.ResourceNotFoundException;
import com.goldtrade.backend.repository.AdminRepository;
import com.goldtrade.backend.repository.PasswordResetTokenRepository;
import com.goldtrade.backend.repository.PortfolioRepository;
import com.goldtrade.backend.repository.UserRepository;
import com.goldtrade.backend.security.JwtService;
import com.goldtrade.backend.service.EmailService;
import com.goldtrade.backend.service.RefreshTokenService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final AdminRepository adminRepo;
    private final PortfolioRepository portfolioRepo;
    private final PasswordResetTokenRepository resetTokenRepo;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(UserRepository userRepo,
                           AdminRepository adminRepo,
                           PortfolioRepository portfolioRepo,
                           PasswordResetTokenRepository resetTokenRepo,
                           EmailService emailService,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           RefreshTokenService refreshTokenService) {
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
        this.portfolioRepo = portfolioRepo;
        this.resetTokenRepo = resetTokenRepo;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    // POST /api/auth/register — join the platform
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@RequestBody Map<String, Object> body) {
        String email = normalizeEmail(body.get("email"));
        String password = (String) body.get("password");
        String fullName = (String) body.get("full_name");
        String phoneNumber = (String) body.get("phone_number");

        if (email.isBlank() || password == null || password.length() < 8) {
            throw new BadRequestException("Email and an 8+ character password are required");
        }
        if (userRepo.findByEmail(email).isPresent()) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setPhoneNumber(phoneNumber);
        user.setEmailVerified(false);
        user.setIsApproved(false);
        user.setKycStatus("pending");
        user.setReferralCode(generateReferralCode(fullName));

        Object rawReferralCode = body.get("referral_code");
        if (rawReferralCode instanceof String code && !code.isBlank()) {
            userRepo.findByReferralCode(code.trim().toUpperCase())
                    .ifPresent(referrer -> user.setReferredBy(referrer.getId()));
        }

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpires(OffsetDateTime.now(ZoneOffset.UTC).plusHours(24));
        userRepo.save(user);

        Portfolio portfolio = new Portfolio();
        portfolio.setUserId(user.getId());
        portfolioRepo.save(portfolio);

        try {
            emailService.sendVerificationEmail(email, token, fullName != null ? fullName : email);
        } catch (Exception e) {
            log.warn("Failed to send verification email to {}: {}", email, e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("user_id", user.getId()),
                "Account created. Please check your email to verify your address before logging in."));
    }

    // GET /api/auth/me
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> me(Authentication auth) {
        String id = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            Admin admin = adminRepo.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "id", admin.getId(),
                    "email", admin.getEmail(),
                    "full_name", admin.getFullName() != null ? admin.getFullName() : "",
                    "role", "admin",
                    "is_approved", true
            )));
        }

        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "full_name", user.getFullName() != null ? user.getFullName() : "",
                "role", "investor",
                "is_approved", user.getIsApproved(),
                "referral_code", user.getReferralCode() != null ? user.getReferralCode() : "",
                "goldtrade_id", user.getGoldtradeId() != null ? user.getGoldtradeId() : ""
        )));
    }

    // POST /api/auth/login — checks the investor table, then the admin table
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@RequestBody Map<String, Object> body) {
        String email = normalizeEmail(body.get("email"));
        String password = (String) body.get("password");
        if (email.isBlank() || password == null) {
            throw new BadRequestException("Email and password are required");
        }

        var adminMatch = adminRepo.findByEmail(email);
        if (adminMatch.isPresent()) {
            Admin admin = adminMatch.get();
            if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
                throw new BadRequestException("Invalid email or password");
            }
            admin.setLastLoginAt(OffsetDateTime.now(ZoneOffset.UTC));
            adminRepo.save(admin);

            String token = jwtService.generateToken(admin.getId(), "admin", admin.getEmail());
            String refreshToken = refreshTokenService.issueForAdmin(admin.getId()).rawToken();
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "access_token", token,
                    "refresh_token", refreshToken,
                    "user", Map.of(
                            "id", admin.getId(),
                            "email", admin.getEmail(),
                            "full_name", admin.getFullName() != null ? admin.getFullName() : "",
                            "role", "admin",
                            "is_approved", true
                    )
            )));
        }

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Please verify your email before logging in");
        }
        if (!Boolean.TRUE.equals(user.getIsApproved())) {
            throw new BadRequestException("Your membership application is still pending approval");
        }

        user.setLastLoginAt(OffsetDateTime.now(ZoneOffset.UTC));
        userRepo.save(user);

        String token = jwtService.generateToken(user.getId(), "investor", user.getEmail());
        String refreshToken = refreshTokenService.issueForUser(user.getId()).rawToken();
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "access_token", token,
                "refresh_token", refreshToken,
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "full_name", user.getFullName() != null ? user.getFullName() : "",
                        "role", "investor",
                        "is_approved", user.getIsApproved()
                )
        )));
    }

    // POST /api/auth/refresh — trades a valid (unused) refresh token for a new short-lived
    // access token, rotating the refresh token in the same call.
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<?>> refresh(@RequestBody Map<String, Object> body) {
        String rawRefreshToken = (String) body.get("refresh_token");
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }

        RefreshTokenService.RotatedToken rotated = refreshTokenService.rotate(rawRefreshToken);

        String accessToken;
        if (rotated.adminId() != null) {
            Admin admin = adminRepo.findById(rotated.adminId())
                    .orElseThrow(() -> new BadRequestException("Invalid or expired refresh token"));
            accessToken = jwtService.generateToken(admin.getId(), "admin", admin.getEmail());
        } else {
            User user = userRepo.findById(rotated.userId())
                    .orElseThrow(() -> new BadRequestException("Invalid or expired refresh token"));
            // Re-check standing on every refresh: an investor rejected/suspended after their
            // last login must not be able to keep renewing access via an old refresh token.
            if (!Boolean.TRUE.equals(user.getEmailVerified()) || !Boolean.TRUE.equals(user.getIsApproved())) {
                refreshTokenService.revoke(rotated.rawToken());
                throw new BadRequestException("Your account is no longer active. Please contact support.");
            }
            accessToken = jwtService.generateToken(user.getId(), "investor", user.getEmail());
        }

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "access_token", accessToken,
                "refresh_token", rotated.rawToken()
        )));
    }

    // POST /api/auth/logout — revokes the refresh token so the session can't be silently
    // renewed again; the short-lived access token still in flight simply expires on its own.
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(@RequestBody(required = false) Map<String, Object> body) {
        String rawRefreshToken = body != null ? (String) body.get("refresh_token") : null;
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenService.revoke(rawRefreshToken);
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out"));
    }

    // PUT /api/auth/change-password — investor or admin changes their own password while logged in
    @Transactional
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<?>> changePassword(@RequestBody Map<String, Object> body, Authentication auth) {
        String newPassword = (String) body.get("new_password");
        if (newPassword == null || newPassword.length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters");
        }

        String id = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        String encoded = passwordEncoder.encode(newPassword);

        if (isAdmin) {
            Admin admin = adminRepo.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
            admin.setPasswordHash(encoded);
            adminRepo.save(admin);
            refreshTokenService.revokeAllForAdmin(id);
        } else {
            User user = userRepo.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
            user.setPasswordHash(encoded);
            userRepo.save(user);
            refreshTokenService.revokeAllForUser(id);
        }

        return ResponseEntity.ok(ApiResponse.success(null,
                "Password updated successfully. Please log in again with your new password."));
    }

    // PUT /api/auth/profile — update the current account's editable profile fields (name only;
    // email is immutable here). Works for both investors and admins.
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<?>> updateProfile(@RequestBody Map<String, Object> body, Authentication auth) {
        String fullName = body.get("full_name") == null ? "" : body.get("full_name").toString().trim();
        if (fullName.isEmpty()) {
            throw new BadRequestException("Full name is required");
        }
        if (fullName.length() > 120) {
            throw new BadRequestException("Full name is too long");
        }

        String id = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            Admin admin = adminRepo.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
            admin.setFullName(fullName);
            adminRepo.save(admin);
        } else {
            User user = userRepo.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
            user.setFullName(fullName);
            userRepo.save(user);
        }

        return ResponseEntity.ok(ApiResponse.success(Map.of("full_name", fullName), "Profile updated"));
    }

    // POST /api/auth/send-verification
    @PostMapping("/send-verification")
    public ResponseEntity<ApiResponse<?>> sendVerification(@RequestBody Map<String, Object> body) {
        String email = normalizeEmail(body.get("email"));
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpires(OffsetDateTime.now(ZoneOffset.UTC).plusHours(24));
        userRepo.save(user);

        emailService.sendVerificationEmail(email, token,
                user.getFullName() != null ? user.getFullName() : email);
        return ResponseEntity.ok(ApiResponse.success(null, "Verification email sent"));
    }

    // POST /api/auth/resend-verification
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<?>> resendVerification(@RequestBody Map<String, Object> body) {
        return sendVerification(body);
    }

    // GET /api/auth/verify-email?token=
    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<?>> verifyEmailGet(@RequestParam String token) {
        return doVerify(token);
    }

    // POST /api/auth/verify-email
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<?>> verifyEmailPost(@RequestBody Map<String, Object> body) {
        return doVerify((String) body.get("token"));
    }

    private ResponseEntity<ApiResponse<?>> doVerify(String token) {
        User user = userRepo.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        if (user.getVerificationTokenExpires().isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
            throw new BadRequestException("Verification token has expired");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setIsApproved(true);
        user.setRejectionReason(null);
        userRepo.save(user);

        return ResponseEntity.ok(ApiResponse.success(null,
                "Email verified. Your account is now active, you can log in."));
    }

    // POST /api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<?>> forgotPassword(@RequestBody Map<String, Object> body) {
        String email = normalizeEmail(body.get("email"));

        userRepo.findByEmail(email).ifPresentOrElse(user -> {
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUserId(user.getId());
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusHours(1));
            resetTokenRepo.save(resetToken);
            try {
                emailService.sendPasswordResetEmail(email, resetToken.getToken());
            } catch (Exception e) {
                log.warn("Failed to send password reset email to {}: {}", email, e.getMessage());
            }
        }, () -> adminRepo.findByEmail(email).ifPresent(admin -> {
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setAdminId(admin.getId());
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusHours(1));
            resetTokenRepo.save(resetToken);
            try {
                emailService.sendPasswordResetEmail(email, resetToken.getToken());
            } catch (Exception e) {
                log.warn("Failed to send password reset email to {}: {}", email, e.getMessage());
            }
        }));

        return ResponseEntity.ok(ApiResponse.success(null,
                "If that email is registered, a reset link has been sent."));
    }

    // POST /api/auth/reset-password
    @Transactional
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<?>> resetPassword(@RequestBody Map<String, Object> body) {
        String token = (String) body.get("token");
        String newPassword = (String) body.get("new_password");
        if (token == null || newPassword == null || newPassword.length() < 8) {
            throw new BadRequestException("Token and an 8+ character new password are required");
        }

        PasswordResetToken resetToken = resetTokenRepo.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));
        if (resetToken.getExpiresAt().isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
            throw new BadRequestException("Reset token has expired");
        }

        String encoded = passwordEncoder.encode(newPassword);
        if (resetToken.getUserId() != null) {
            User user = userRepo.findById(resetToken.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
            user.setPasswordHash(encoded);
            userRepo.save(user);
            refreshTokenService.revokeAllForUser(user.getId());
        } else {
            Admin admin = adminRepo.findById(resetToken.getAdminId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
            admin.setPasswordHash(encoded);
            adminRepo.save(admin);
            refreshTokenService.revokeAllForAdmin(admin.getId());
        }
        resetTokenRepo.delete(resetToken);

        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }

    private String generateReferralCode(String fullName) {
        String base = (fullName != null && !fullName.isBlank())
                ? fullName.replaceAll("[^A-Za-z]", "").toUpperCase()
                : "MEMBER";
        String prefix = base.length() >= 4 ? base.substring(0, 4) : (base + "GOLD").substring(0, 4);
        SecureRandom random = new SecureRandom();
        String suffix = String.format("%04d", random.nextInt(10000));
        return "GOLD-" + prefix + suffix;
    }

    private String normalizeEmail(Object rawEmail) {
        return rawEmail instanceof String s ? s.trim().toLowerCase() : "";
    }
}
