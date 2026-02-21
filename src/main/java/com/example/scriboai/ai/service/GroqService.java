package com.example.scriboai.ai.service;

import com.example.scriboai.common.exception.AiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class GroqService {

    private final WebClient.Builder webClientBuilder;

    @Value("${ai.groq.api-key}")
    private String groqKey;

    public String ask(String prompt) {

        Map<String, Object> body = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", new Object[]{
                        Map.of("role", "user", "content", prompt)
                }
        );

        Map response = webClientBuilder.build()
                .post()
                .uri("https://api.groq.com/openai/v1/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + groqKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        try {
            var choices = (java.util.List<Map>) response.get("choices");
            var message = (Map) choices.get(0).get("message");
            return message.get("content").toString();
        } catch (Exception e) {
            throw new AiException("Invalid response from Groq");
        }
    }
}