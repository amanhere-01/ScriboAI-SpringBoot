package com.example.scriboai.ai.dto;

public record AiChatRequest(
        String message,
        String provider
) {}