package com.example.scriboai.folder.dto;

import jakarta.validation.constraints.NotBlank;

public record FolderNameRequest(
        @NotBlank
        String name
) {
}
