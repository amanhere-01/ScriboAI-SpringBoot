package com.example.scriboai.ai.service;

import com.example.scriboai.ai.dto.Message;
import com.example.scriboai.common.exception.AiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public String chat(String provider, String document, List<Message> messages) {

        if (messages == null || messages.isEmpty()) {
            throw new AiException("Messages cannot be empty");
        }

        String prompt = buildChatPrompt(document, messages);
//        return prompt;
        System.out.println("PROMPT__________________________" + prompt);

        if ("gemini".equalsIgnoreCase(provider)) {
            String result = geminiService.ask(prompt);
            if (result == null) throw new AiException("Empty response from AI provider");
            return result;
        }

        if ("groq".equalsIgnoreCase(provider)) {
            String result = groqService.ask(prompt);
            if (result == null) throw new AiException("Empty response from AI provider");
            return result;
        }

        throw new AiException("Invalid AI provider selected");
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

    private String buildChatPrompt(String document, List<Message> messages) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
You are an advanced AI writing assistant inside a document editor.

YOUR ROLE:
You help users write, edit, improve, and understand their document.

-----------------------------------
CAPABILITIES:

1. DOCUMENT-AWARE:
- Always use the provided document as primary context
- Refer to specific sections when relevant
- If the document is empty, behave like a normal assistant

2. EDITING TASKS:
- Improve writing quality
- Rewrite sections
- Expand or shorten content
- Fix clarity, tone, and grammar

3. ANALYSIS TASKS:
- Summarize document or sections
- Explain parts clearly
- Identify issues or inconsistencies

4. STRUCTURED OUTPUT:
- Use bullet points when helpful
- Use headings when organizing content
- Keep responses clean and readable

-----------------------------------
BEHAVIOR RULES:

- Be concise but helpful
- Do NOT repeat the entire document unless asked
- Do NOT say "based on the document" repeatedly
- Do NOT mention that you are an AI model
- If the user asks to modify, rewrite, improve, or generate document content:
  → Return ONLY the updated content
  → Do NOT include explanations, introductions, or extra text
  → Do NOT say things like "Here is the improved version"
- If user asks a question → answer normally

-----------------------------------
SMART UNDERSTANDING:

- If user says:
  "improve this" → improve relevant part of document
  "shorten it" → shorten relevant section
  "rewrite intro" → focus on introduction
  "continue writing" → continue from document context

-----------------------------------
OUTPUT STYLE:

- Keep output clean and ready to insert into a document
- Avoid unnecessary explanations unless explicitly asked
- Prefer structured, readable formatting

-----------------------------------
DOCUMENT:
""");

        prompt.append(document != null && !document.isBlank() ? document : "Document is empty.");

        prompt.append("""
-----------------------------------
CONVERSATION:
""");

        for (Message msg : messages) {
            prompt.append(msg.role().toUpperCase())
                    .append(": ")
                    .append(msg.content())
                    .append("\n");
        }

        prompt.append("\nASSISTANT:");

        return prompt.toString();
    }

    private String buildPrompt(String action, String text) {
        return switch (action.toLowerCase()) {

            case "summarize" -> """
            Summarize the following text.
    
            IMPORTANT:
            - Capture key points only
            - Keep it concise
            - Use simple language
            - Return ONLY the summarized text
    
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