package com.goldtrade.backend.security;

import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory sliding-window rate limiter.
 * No Redis required — state is per-instance (fine for a single Railway dyno).
 */
@Service
public class RateLimitService {

    private final Map<String, Deque<Long>> buckets = new ConcurrentHashMap<>();

    /**
     * @param key         unique key, typically "ip:endpoint"
     * @param maxRequests max allowed requests in the window
     * @param windowMs    window size in milliseconds
     * @return true if the request is allowed, false if rate-limited
     */
    public boolean isAllowed(String key, int maxRequests, long windowMs) {
        long now = System.currentTimeMillis();

        buckets.putIfAbsent(key, new ArrayDeque<>());
        Deque<Long> timestamps = buckets.get(key);

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > windowMs) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxRequests) {
                return false;
            }

            timestamps.addLast(now);
            return true;
        }
    }
}
