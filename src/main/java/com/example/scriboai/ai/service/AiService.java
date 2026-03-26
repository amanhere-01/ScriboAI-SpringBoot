package com.example.scriboai.ai.service;

import com.example.scriboai.common.exception.AiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiService {

    private final GeminiService geminiService;
    private final GroqService groqService;

    public String processAction(String action, String text){
        if (text == null || text.isBlank()) {
            throw new AiException("Message cannot be empty");
        }

        if (action == null || action.isBlank()) {
            throw new AiException("Action cannot be empty");
        }

        String prompt = buildPrompt(action, text);

        String result = groqService.ask(prompt);
        if (result == null) {
            throw new AiException("Empty response from AI provider");
        }
        return result;
    }



    public String ask(String provider, String message) {

        if (message == null || message.isBlank()) {
            throw new AiException("Message cannot be empty");
        }

        if ("gemini".equalsIgnoreCase(provider)) {
            String result = geminiService.ask(message);
            if (result == null) {
                throw new AiException("Empty response from AI provider");
            }
            return result;
        }

        if ("groq".equalsIgnoreCase(provider)) {
            String result = groqService.ask(message);
            if (result == null) {
                throw new AiException("Empty response from AI provider");
            }
            return result;
        }

        throw new AiException("Invalid AI provider selected");
    }

    private String buildPrompt(String action, String text) {
        return switch (action.toLowerCase()) {

            case "rewrite" -> """
            Rewrite the following text in a clearer and more professional way.
            
            IMPORTANT:
            - Keep the meaning exactly the same
            - Do NOT add extra content
            - Keep length similar
            - Return ONLY the rewritten text
            
            Text:
            %s
            """.formatted(text);

            case "improve" -> """
            Improve the writing quality of the following text.
            Make it more polished and fluent.
            
            IMPORTANT:
            - Do NOT change the meaning
            - Do NOT add new information
            - Keep the length similar
            - Return ONLY the improved text
            
            Text:
            %s
            """.formatted(text);

            case "shorten" -> """
            Shorten the following text while preserving the key meaning.
            
            IMPORTANT:
            - Keep main points
            - Remove unnecessary words
            - Return ONLY the shortened text
            
            Text:
            %s
            """.formatted(text);

            case "explain" -> """
            Explain the following text in a simple and easy-to-understand way.
            
            IMPORTANT:
            - Keep explanation concise
            - Do NOT repeat original text fully
            - Return ONLY the explanation
            
            Text:
            %s
            """.formatted(text);

            default -> throw new AiException("Invalid action type");
        };
    }

    private String cleanOutput(String text) {
        return text
                .replaceAll("(?i)^here is.*?:", "")
                .replaceAll("(?i)^improved version:", "")
                .trim();
    }
}