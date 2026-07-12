package com.goldtrade.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * Sliding-window rate limiting for sensitive public endpoints.
 *
 * Rules:
 *  POST /api/auth/register           → 5 req / 60s  per IP
 *  POST /api/auth/send-verification  → 5 req / 60s  per IP
 *  POST /api/auth/resend-verification→ 5 req / 60s  per IP
 *  POST /api/auth/login              → 10 req / 60s per IP
 *  POST /api/auth/forgot-password    → 5 req / 60s  per IP
 *  POST /api/auth/refresh            → 30 req / 60s per IP (silent refresh across tabs/devices)
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RateLimitFilter(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String method = request.getMethod();
        String path   = request.getRequestURI();
        String ip     = getClientIp(request);

        boolean allowed = true;

        if ("POST".equalsIgnoreCase(method)) {
            if (path.startsWith("/api/auth/register")
                    || path.startsWith("/api/auth/send-verification")
                    || path.startsWith("/api/auth/resend-verification")
                    || path.startsWith("/api/auth/forgot-password")) {
                allowed = rateLimitService.isAllowed(ip + ":" + path, 5, 60_000);
            } else if (path.startsWith("/api/auth/login")) {
                allowed = rateLimitService.isAllowed(ip + ":" + path, 10, 60_000);
            } else if (path.startsWith("/api/auth/refresh")) {
                allowed = rateLimitService.isAllowed(ip + ":" + path, 30, 60_000);
            }
        }

        if (!allowed) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(),
                    Map.of("success", false,
                           "error", "Too many requests. Please wait a moment and try again."));
            return;
        }

        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
