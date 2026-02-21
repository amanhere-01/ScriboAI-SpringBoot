package com.example.scriboai.auth.dto;

public record UserResponse(
        Long Id,
        String username,
        String email
) {
}
