package com.example.scriboai.ai.service;

import com.example.scriboai.common.exception.AiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService {

    private final WebClient.Builder webClientBuilder;

    @Value("${ai.gemini.api-key}")
    private String geminiKey;

    public String ask(String prompt) {

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiKey;

        Map<String, Object> body = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                }
        );

        Map response = webClientBuilder.build()
                .post()
                .uri(url)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        try {
            var candidates = (java.util.List<Map>) response.get("candidates");
            var content = (Map) candidates.get(0).get("content");
            var parts = (java.util.List<Map>) content.get("parts");
            return parts.get(0).get("text").toString();
        } catch (Exception e) {
            throw new AiException("Invalid response from Gemini");
        }
    }
}