package com.fsoft.kbase.service;

import com.fsoft.kbase.dto.request.CreateProjectRequest;
import com.fsoft.kbase.dto.request.UpdateProjectRequest;
import com.fsoft.kbase.dto.response.PagedResponse;
import com.fsoft.kbase.dto.response.ProjectResponse;

public interface ProjectService {
    ProjectResponse createProject(String ownerEmail, CreateProjectRequest request);
    ProjectResponse getProject(Long projectId, String userEmail);
    PagedResponse<ProjectResponse> getMyProjects(String userEmail, int page, int size);
    PagedResponse<ProjectResponse> getAllProjects(int page, int size);
    ProjectResponse updateProject(Long projectId, String userEmail, UpdateProjectRequest request);
    void deleteProject(Long projectId, String userEmail);
}
