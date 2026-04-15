package com.example.scriboai.folder.dto;

import com.example.scriboai.document.dto.response.DocumentResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@Getter
public class FolderWithDocsResponse{

    private FolderResponse folder;
    private List<DocumentResponse> docs;
}
