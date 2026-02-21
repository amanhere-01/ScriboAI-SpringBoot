package com.example.scriboai.document.mapper;

import com.example.scriboai.document.dto.response.DocumentResponse;
import com.example.scriboai.document.model.Document;

public class DocumentMapper {

    public static DocumentResponse toResponse(Document document){
        return new DocumentResponse(
                document.getId(),
                document.getTitle(),
                document.getContent(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }
}
