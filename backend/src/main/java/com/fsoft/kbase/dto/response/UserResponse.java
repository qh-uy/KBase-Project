package com.fsoft.kbase.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String role;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
