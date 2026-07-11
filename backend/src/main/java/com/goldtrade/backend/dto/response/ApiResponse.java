package com.goldtrade.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private String error;

    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.data = data;
        r.message = message;
        return r;
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, null);
    }

    public static <T> ApiResponse<T> error(String error) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false;
        r.error = error;
        return r;
    }
}
