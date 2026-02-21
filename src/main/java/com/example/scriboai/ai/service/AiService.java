package com.example.scriboai.ai.service;

import com.example.scriboai.common.exception.AiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiService {

    private final GeminiService geminiService;
    private final GroqService groqService;

    public String ask(String provider, String message) {

        if (message == null || message.isBlank()) {
            throw new AiException("Message cannot be empty");
        }

        if ("gemini".equalsIgnoreCase(provider)) {
            return geminiService.ask(message);
        }

        if ("groq".equalsIgnoreCase(provider)) {
            return groqService.ask(message);
        }

        throw new AiException("Invalid AI provider selected");
    }
}