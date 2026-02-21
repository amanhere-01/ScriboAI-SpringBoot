package com.example.scriboai.document.dto.response;

import java.time.LocalDateTime;

public record DocumentResponse(
        Long id,
        String title,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
        ) {
}
