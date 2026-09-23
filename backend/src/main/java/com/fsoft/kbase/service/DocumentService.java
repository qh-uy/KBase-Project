package com.fsoft.kbase.service;

import com.fsoft.kbase.dto.response.DocumentResponse;
import com.fsoft.kbase.dto.response.PagedResponse;
import com.fsoft.kbase.entity.enums.DocumentType;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentService {
    DocumentResponse uploadDocument(Long projectId, String userEmail, MultipartFile file, String description);
    PagedResponse<DocumentResponse> getDocuments(Long projectId, String userEmail,
                                                  DocumentType fileType, String search,
                                                  int page, int size);
    DocumentResponse getDocument(Long projectId, Long documentId, String userEmail);
    void deleteDocument(Long projectId, Long documentId, String userEmail);
}
