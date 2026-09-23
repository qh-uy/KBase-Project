package com.fsoft.kbase.service.impl;

import com.fsoft.kbase.dto.request.CreateProjectRequest;
import com.fsoft.kbase.dto.request.UpdateProjectRequest;
import com.fsoft.kbase.dto.response.PagedResponse;
import com.fsoft.kbase.dto.response.ProjectResponse;
import com.fsoft.kbase.dto.response.UserResponse;
import com.fsoft.kbase.entity.Project;
import com.fsoft.kbase.entity.User;
import com.fsoft.kbase.exception.ResourceNotFoundException;
import com.fsoft.kbase.repository.ProjectRepository;
import com.fsoft.kbase.repository.UserRepository;
import com.fsoft.kbase.service.ProjectService;
import com.fsoft.kbase.util.PaginationUtils;
import com.fsoft.kbase.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ProjectResponse createProject(String ownerEmail, CreateProjectRequest request) {
        User owner = getUserByEmail(ownerEmail);
        String slug = SlugUtils.generateUniqueSlug(request.getName(), projectRepository::existsBySlug);

        Project project = Project.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .coverUrl(request.getCoverUrl())
                .owner(owner)
                .isActive(true)
                .build();

        project = projectRepository.save(project);
        log.info("Project created: {} by {}", project.getName(), ownerEmail);
        return toResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId, String userEmail) {
        Project project = getActiveProject(projectId);
        return toResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getMyProjects(String userEmail, int page, int size) {
        User user = getUserByEmail(userEmail);
        
        // ADMIN can see all projects
        if (user.getRole().getName().name().equals("ADMIN")) {
            return getAllProjects(page, size);
        }
        
        Pageable pageable = PaginationUtils.buildPageable(page, size, "createdAt", "desc");
        Page<Project> projects = projectRepository.findProjectsByUserId(user.getId(), pageable);
        return PaginationUtils.buildResponse(projects.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getAllProjects(int page, int size) {
        Pageable pageable = PaginationUtils.buildPageable(page, size, "createdAt", "desc");
        Page<Project> projects = projectRepository.findByIsActiveTrue(pageable);
        return PaginationUtils.buildResponse(projects.map(this::toResponse));
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long projectId, String userEmail, UpdateProjectRequest request) {
        Project project = getActiveProject(projectId);
        assertOwner(project, userEmail);

        if (StringUtils.hasText(request.getName())) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getCoverUrl() != null) {
            project.setCoverUrl(request.getCoverUrl());
        }

        return toResponse(projectRepository.save(project));
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId, String userEmail) {
        Project project = getActiveProject(projectId);
        assertOwner(project, userEmail);
        project.setIsActive(false);
        projectRepository.save(project);
        log.info("Project soft-deleted: {} by {}", projectId, userEmail);
    }

    // ─── helpers ───────────────────────────────────────────────────────────────

    private Project getActiveProject(Long projectId) {
        return projectRepository.findById(projectId)
                .filter(p -> p.getIsActive())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private void assertOwner(Project project, String userEmail) {
        if (!project.getOwner().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("Only the project owner can perform this action");
        }
    }

    private ProjectResponse toResponse(Project project) {
        long memberCount   = projectRepository.countActiveMembers(project.getId());
        long documentCount = projectRepository.countDocuments(project.getId());

        UserResponse ownerResponse = UserResponse.builder()
                .id(project.getOwner().getId())
                .email(project.getOwner().getEmail())
                .fullName(project.getOwner().getFullName())
                .avatarUrl(project.getOwner().getAvatarUrl())
                .role(project.getOwner().getRole().getName().name())
                .build();

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .slug(project.getSlug())
                .description(project.getDescription())
                .coverUrl(project.getCoverUrl())
                .owner(ownerResponse)
                .memberCount(memberCount)
                .documentCount(documentCount)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
