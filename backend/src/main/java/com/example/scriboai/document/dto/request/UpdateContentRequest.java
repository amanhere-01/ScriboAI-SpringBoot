package com.example.scriboai.document.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateContentRequest(
        @NotBlank String content
) {
}
