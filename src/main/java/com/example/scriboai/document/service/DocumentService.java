package com.example.scriboai.document.service;

import com.example.scriboai.common.exception.ResourceNotFoundException;
import com.example.scriboai.document.repository.DocumentRepository;
import com.example.scriboai.document.dto.response.DocumentResponse;
import com.example.scriboai.document.mapper.DocumentMapper;
import com.example.scriboai.document.model.Document;
import com.example.scriboai.user.model.User;
import com.example.scriboai.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    private User getUserByEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // CREATE DOCUMENT
    @Transactional
    public DocumentResponse createDocument(String email) {
        User user = getUserByEmail(email);

        Document document = Document.builder()
                .owner(user)
                .title("Untitled Document")
                .folder(null)
                .build();

        Document saved = documentRepository.save(document);
        return DocumentMapper.toResponse(saved);
    }

    // GET ALL DOCUMENTS (ROOT ONLY)
    public List<DocumentResponse> getAllDocs(String email){
        User user = getUserByEmail(email);

        return documentRepository
                .findByOwner_IdAndFolderIsNullOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(DocumentMapper::toResponse)
                .toList();
    }

    public DocumentResponse getDocumentById(Long docId, String email){
        User user = getUserByEmail(email);

        Document document = documentRepository
                .findByIdAndOwner_Id(docId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        return DocumentMapper.toResponse(document);
    }


    // UPDATE CONTENT
    @Transactional
    public void updateContent(Long docId, String content, String email){
        if (content == null) {
            throw new RuntimeException("Content is required");
        }

        User user = getUserByEmail(email);

        Document document = documentRepository
                .findByIdAndOwner_Id(docId, user.getId())
                .orElseThrow(() -> new RuntimeException("Access denied"));

        document.setContent(content);
    }

    // UPDATE TITLE
    @Transactional
    public void updateTitle(Long docId, String title, String email) {

        User user = getUserByEmail(email);

        Document document = documentRepository
                .findByIdAndOwner_Id(docId, user.getId())
                .orElseThrow(() -> new RuntimeException("Access denied"));

        document.setTitle(title);
    }

    @Transactional
    public void deleteDocument(Long docId, String email){
        User user = getUserByEmail(email);

        Document document = documentRepository
                .findByIdAndOwner_Id(docId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        documentRepository.delete(document);
    }

    public long getDocumentCount(String email){
        User user = getUserByEmail(email);
        return documentRepository.countByOwnerId(user.getId());
    }

}
