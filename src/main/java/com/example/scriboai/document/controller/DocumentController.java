package com.example.scriboai.document.controller;

import com.example.scriboai.document.dto.request.UpdateContentRequest;
import com.example.scriboai.document.dto.request.UpdateTitleRequest;
import com.example.scriboai.document.dto.response.DocumentResponse;
import com.example.scriboai.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/docs")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    public ResponseEntity<DocumentResponse> createDocument(Authentication auth){
        DocumentResponse response = documentService.createDocument(auth.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAllDocs(Authentication authentication){
        List<DocumentResponse> docs = documentService.getAllDocs(authentication.getName());
        return ResponseEntity.ok(docs);
    }

    @GetMapping("/{docId}")
    public ResponseEntity<DocumentResponse> getDocById(@PathVariable Long docId, Authentication authentication){
        DocumentResponse doc = documentService.getDocumentById(docId, authentication.getName());

        return ResponseEntity.ok(doc);
    }

    @PutMapping("/{docId}")
    public ResponseEntity<?> updateContent(@PathVariable Long docId,
                                           @RequestBody UpdateContentRequest request,
                                           Authentication auth){
        documentService.updateContent(docId, request.content(), auth.getName());

        return ResponseEntity.ok(Map.of("message", "Document saved"));
    }

    @PatchMapping("/{docId}/title")
    public ResponseEntity<?> updateTitle(@PathVariable Long docId,
                                         @RequestBody UpdateTitleRequest request,
                                         Authentication authentication) {

        documentService.updateTitle(
                docId,
                request.title(),
                authentication.getName()
        );

        return ResponseEntity.ok(Map.of("message", "Title updated"));
    }

    // DELETE
    @DeleteMapping("/{docId}")
    public ResponseEntity<?> delete(@PathVariable Long docId,
                                    Authentication authentication) {

        documentService.deleteDocument(docId, authentication.getName());

        return ResponseEntity.ok(Map.of("message", "Document deleted"));
    }

    // COUNT
    @GetMapping("/count")
    public ResponseEntity<?> count(Authentication authentication) {

        long count = documentService.getDocumentCount(authentication.getName());

        return ResponseEntity.ok(Map.of("count", count));
    }
}
