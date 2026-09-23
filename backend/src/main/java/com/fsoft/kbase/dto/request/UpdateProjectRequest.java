package com.fsoft.kbase.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProjectRequest {

    @Size(min = 3, max = 100, message = "Project name must be between 3 and 100 characters")
    private String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private String coverUrl;
}
