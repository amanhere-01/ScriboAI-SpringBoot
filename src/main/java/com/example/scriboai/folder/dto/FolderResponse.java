package com.example.scriboai.folder.dto;

import java.time.LocalDateTime;

public record FolderResponse(
        Long id,
        String name,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
