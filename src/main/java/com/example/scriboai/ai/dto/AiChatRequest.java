package com.example.scriboai.ai.dto;

import java.util.List;

public record AiChatRequest(
        String provider,
        String document,
        List<Message> messages
) {}