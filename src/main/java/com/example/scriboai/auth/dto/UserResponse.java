package com.example.scriboai.auth.dto;

public record UserResponse(
        Integer Id,
        String username,
        String email
) {
}
