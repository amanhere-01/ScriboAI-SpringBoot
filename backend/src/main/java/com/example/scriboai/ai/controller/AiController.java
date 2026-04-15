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

    @PostMapping("/action")
    public AiActionResponse actionResponse(@RequestBody AiActionRequest request){
        String reply = aiService.processAction(request.action(), request.text());
        return new AiActionResponse(reply);
    }

    @PostMapping("/chat")
    public AiChatResponse chat(@RequestBody AiChatRequest request) {

        String reply = aiService.chat(
                request.provider(),
                request.document(),
                request.messages()
        );
        System.out.println("REPLY____________________________" + reply);
        return new AiChatResponse(reply);
    }
}