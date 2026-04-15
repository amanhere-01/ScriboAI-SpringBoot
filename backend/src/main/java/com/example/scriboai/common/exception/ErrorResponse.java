package com.example.scriboai.common.exception;

public record ErrorResponse(
        String errorCode,
        String message
) {
}
