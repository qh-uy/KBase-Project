package com.fsoft.kbase.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DocumentResponse {
    private Long id;
    private Long projectId;
    private String originalName;
    private String fileName;
    private String fileType;
    private String mimeType;
    private Long fileSize;
    private String fileSizeFormatted;   // "2.5 MB"
    private String description;
    private String downloadUrl;         // Pre-signed MinIO URL
    private Integer downloadCount;
    private UserResponse uploadedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
