package com.example.scriboai.folder.mapper;

import com.example.scriboai.folder.dto.FolderResponse;
import com.example.scriboai.folder.model.Folder;

public class FolderMapper {

    public static FolderResponse toResponse(Folder folder){
        return new FolderResponse(
                folder.getId(),
                folder.getName(),
                folder.getCreatedAt(),
                folder.getUpdatedAt()
        );
    }
}
