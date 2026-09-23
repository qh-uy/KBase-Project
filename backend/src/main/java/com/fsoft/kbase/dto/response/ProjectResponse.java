package com.fsoft.kbase.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String coverUrl;
    private UserResponse owner;
    private Long memberCount;
    private Long documentCount;
    private Long totalStorageBytes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
