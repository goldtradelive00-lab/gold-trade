package com.goldtrade.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private final WebClient webClient;

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${resend.from-email}")
    private String fromEmail;

    @Value("${app.url}")
    private String appUrl;

    public EmailService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://api.resend.com").build();
    }

    public void sendEmail(String to, String subject, String html) {
        webClient.post()
                .uri("/emails")
                .header("Authorization", "Bearer " + resendApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(Map.of(
                        "from", fromEmail,
                        "to", List.of(to),
                        "subject", subject,
                        "html", html
                ))
                .retrieve()
                .toBodilessEntity()
                .block();
    }

    public void sendVerificationEmail(String to, String token, String fullName) {
        String verifyUrl = appUrl + "/verify-email?token=" + token;
        String html = brandedTemplate(
                "Verify your email",
                "Hello " + fullName + ",",
                "Please verify your email address to activate your GoldTrade membership application.",
                verifyUrl,
                "Verify Email"
        ) + "<p style='color:#9AA0A6;font-size:13px;'>This link expires in 24 hours.</p>";
        sendEmail(to, "Verify your GoldTrade email", html);
    }

    public void sendApprovalEmail(String to, String fullName) {
        String html = brandedTemplate(
                "Welcome to the Inner Circle",
                "Congratulations " + fullName + ",",
                "Your GoldTrade private wealth membership has been approved. You can now log in to your dashboard.",
                appUrl + "/login",
                "Log In to Dashboard"
        );
        sendEmail(to, "Your GoldTrade membership is approved", html);
    }

    public void sendRejectionEmail(String to, String fullName, String reason) {
        String html = "<h2 style='font-family:Georgia,serif;color:#F2F1EC;'>Application Update</h2>" +
                "<p style='color:#F2F1EC;'>Hello " + fullName + ",</p>" +
                "<p style='color:#F2F1EC;'>Unfortunately, your GoldTrade membership application was not approved at this time.</p>" +
                (reason != null ? "<p style='color:#F2F1EC;'>Reason: " + reason + "</p>" : "") +
                "<p style='color:#9AA0A6;'>Please contact support if you have questions.</p>";
        sendEmail(to, "Update on your GoldTrade application", html);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = appUrl + "/reset-password?token=" + token;
        String html = brandedTemplate(
                "Reset your password",
                "Hello,",
                "We received a request to reset your GoldTrade password. If this wasn't you, ignore this email.",
                resetUrl,
                "Reset Password"
        ) + "<p style='color:#9AA0A6;font-size:13px;'>This link expires in 1 hour.</p>";
        sendEmail(to, "Reset your GoldTrade password", html);
    }

    private String brandedTemplate(String heading, String greeting, String body, String ctaUrl, String ctaLabel) {
        return "<div style='background:#0B0D10;padding:40px;font-family:Helvetica,Arial,sans-serif;'>"
                + "<h1 style='font-family:Georgia,serif;color:#C9A227;font-size:22px;letter-spacing:0.05em;'>GOLDTRADE</h1>"
                + "<h2 style='font-family:Georgia,serif;color:#F2F1EC;font-weight:500;'>" + heading + "</h2>"
                + "<p style='color:#F2F1EC;'>" + greeting + "</p>"
                + "<p style='color:#F2F1EC;'>" + body + "</p>"
                + "<a href='" + ctaUrl + "' style='display:inline-block;background:#C9A227;color:#0B0D10;padding:12px 28px;"
                + "text-decoration:none;border-radius:8px;font-weight:bold;margin-top:16px;'>" + ctaLabel + "</a>"
                + "</div>";
    }
}
