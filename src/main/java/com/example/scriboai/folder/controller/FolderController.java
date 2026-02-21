package com.example.scriboai.folder.controller;

import com.example.scriboai.document.dto.response.DocumentResponse;
import com.example.scriboai.folder.dto.FolderNameRequest;
import com.example.scriboai.folder.dto.FolderResponse;
import com.example.scriboai.folder.dto.FolderWithDocsResponse;
import com.example.scriboai.folder.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/f")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService service;

    @PostMapping
    public ResponseEntity<FolderResponse> createFolder(@RequestBody FolderNameRequest request, Authentication auth){
        FolderResponse response = service.createFolder(request.name(), auth.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{folderId}/docs")
    public ResponseEntity<DocumentResponse> createDocInFolder(@PathVariable Long folderId, Authentication auth){
        DocumentResponse response = service.createDocInFolder(folderId, auth.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<FolderResponse>> getAllFolders(Authentication authentication){
        List<FolderResponse> folders = service.getAllFolders(authentication.getName());
        return ResponseEntity.ok(folders);
    }

    @GetMapping("/{folderId}")
    public ResponseEntity<FolderWithDocsResponse> getFolderData(@PathVariable Long folderId, Authentication auth){
        FolderWithDocsResponse response = service.getFolderData(folderId, auth.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{folderId}")
    public ResponseEntity<?> updateFolderName(@PathVariable Long folderId,
                                              @RequestBody FolderNameRequest request,
                                              Authentication auth
                                              ){
        service.updateFolderName(folderId, request.name(), auth.getName());

        return ResponseEntity.ok(Map.of("message", "Title updated"));
    }

    @DeleteMapping("/{folderId}")
    public ResponseEntity<?> deleteFolder(@PathVariable Long folderId,Authentication auth){
        service.deleteFolder(folderId, auth.getName());

        return ResponseEntity.ok(Map.of("message", "Folder deleted"));
    }

    // COUNT
    @GetMapping("/count")
    public ResponseEntity<?> count(Authentication authentication) {

        long count = service.getFolderCount(authentication.getName());

        return ResponseEntity.ok(Map.of("count", count));
    }
}
