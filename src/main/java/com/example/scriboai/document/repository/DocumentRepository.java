package com.example.scriboai.document.repository;

import com.example.scriboai.document.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    Optional<Document> findByIdAndOwner_Id(Long id, Long ownerId);

    List<Document> findByOwner_IdAndFolderIsNullOrderByUpdatedAtDesc(Long ownerId);
//    List<Document> findByOwner_IdOrderByUpdatedAtDesc(Long ownerId);

    List<Document> findByOwner_IdAndFolder_IdOrderByUpdatedAtDesc(Long ownerId, Long folderId);

    long countByOwnerId(Long ownerId);
}
