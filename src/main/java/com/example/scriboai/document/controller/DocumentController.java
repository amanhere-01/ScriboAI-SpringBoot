package com.example.scriboai.document.controller;

import com.example.scriboai.document.Repository.DocumentRepository;
import com.example.scriboai.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docs")
@RequiredArgsConstructor

public class DocumentController {

    private DocumentService documentService;

    @GetMapping
    public void getAllDocs(){
        documentService.getAllDocs();
    }
}
