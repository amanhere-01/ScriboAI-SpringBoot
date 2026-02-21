package com.example.scriboai.ai.controller;

import com.example.scriboai.ai.dto.*;
import com.example.scriboai.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public AiChatResponse chat(@RequestBody AiChatRequest request) {

        String reply = aiService.ask(
                request.provider(),
                request.message()
        );

        return new AiChatResponse(reply);
    }
}