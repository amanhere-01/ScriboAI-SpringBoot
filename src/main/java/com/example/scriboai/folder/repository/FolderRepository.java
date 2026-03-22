package com.example.scriboai.folder.repository;

import com.example.scriboai.folder.model.Folder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FolderRepository extends JpaRepository<Folder, Long> {

    Optional<Folder> findByIdAndOwner_Id(Long id, Long ownerId);

//    List<Folder> findByOwner_IdOrderByNameAsc(Long ownerId);

    Page<Folder> findByOwner_Id(Long ownerId, Pageable pageable);

    long countByOwner_Id(Long ownerId);
}
