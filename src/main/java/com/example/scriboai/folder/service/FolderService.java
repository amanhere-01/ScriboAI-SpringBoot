package com.example.scriboai.folder.service;

import com.example.scriboai.common.exception.ResourceNotFoundException;
import com.example.scriboai.document.dto.response.DocumentResponse;
import com.example.scriboai.document.mapper.DocumentMapper;
import com.example.scriboai.document.model.Document;
import com.example.scriboai.document.repository.DocumentRepository;
import com.example.scriboai.folder.dto.FolderResponse;
import com.example.scriboai.folder.dto.FolderWithDocsResponse;
import com.example.scriboai.folder.mapper.FolderMapper;
import com.example.scriboai.folder.model.Folder;
import com.example.scriboai.folder.repository.FolderRepository;
import com.example.scriboai.user.model.User;
import com.example.scriboai.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.print.Doc;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FolderService {
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    private User getUserByEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public FolderResponse createFolder(String folderName, String email){
        User user = getUserByEmail(email);

        Folder folder = Folder.builder()
                .name(folderName)
                .owner(user)
                .build();

        Folder saved = folderRepository.save(folder);

        return FolderMapper.toResponse(saved);
    }

    public DocumentResponse createDocInFolder(Long folderId, String email) {
        User user = getUserByEmail(email);
        Folder folder = folderRepository
                .findByIdAndOwner_Id(folderId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));

        Document document = Document.builder()
                .owner(user)
                .title("Untitled Document")
                .folder(folder)
                .build();

        Document saved = documentRepository.save(document);

        return DocumentMapper.toResponse(saved);
    }

    public List<FolderResponse> getAllFolders(String email){
        User user = getUserByEmail(email);

        return folderRepository
                .findByOwner_IdOrderByNameAsc(user.getId())
                .stream()
                .map(FolderMapper::toResponse)
                .toList();
    }

    public FolderWithDocsResponse getFolderData(Long folderId, String email){
        User user = getUserByEmail(email);

        Folder folder =  folderRepository
                .findByIdAndOwner_Id(folderId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));

        List<DocumentResponse> docs = documentRepository
                .findByOwner_IdAndFolder_IdOrderByUpdatedAtDesc(user.getId(), folderId)
                .stream()
                .map(DocumentMapper::toResponse)
                .toList();

        return new FolderWithDocsResponse(
                FolderMapper.toResponse(folder),
                docs
        );

    }

    public void updateFolderName(Long folderId, String folderName, String email){
        User user = getUserByEmail(email);

        Folder folder = folderRepository
                .findByIdAndOwner_Id(folderId, user.getId())
                .orElseThrow(() -> new RuntimeException("Access denied"));

        folder.setName(folderName);

    }

    public void deleteFolder(Long folderId, String email){
        User user = getUserByEmail(email);

        Folder folder = folderRepository
                .findByIdAndOwner_Id(folderId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));

        folderRepository.delete(folder);
    }

    public long getFolderCount(String email){
        User user = getUserByEmail(email);

        return folderRepository.countByOwner_Id(user.getId());
    }


}
