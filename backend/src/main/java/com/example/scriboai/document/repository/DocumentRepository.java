package com.example.scriboai.document.repository;

import com.example.scriboai.document.model.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    Optional<Document> findByIdAndOwner_Id(Long id, Long ownerId);

//    List<Document> findByOwner_IdAndFolderIsNullOrderByUpdatedAtDesc(Long ownerId);
//
    List<Document> findByOwner_IdAndFolder_IdOrderByUpdatedAtDesc(Long ownerId, Long folderId);

    Page<Document> findByOwner_IdAndFolderIsNull(
            Long ownerId,
            Pageable pageable
    );

//    Page<Document> findByOwner_IdAndFolder_Id(
//            Long ownerId,
//            Long folderId,
//            Pageable pageable
//    );

    long countByOwnerId(Long ownerId);
}
