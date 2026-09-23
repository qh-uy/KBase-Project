package com.fsoft.kbase.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectMemberResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String status;
    private LocalDateTime invitedAt;
    private LocalDateTime joinedAt;
}
