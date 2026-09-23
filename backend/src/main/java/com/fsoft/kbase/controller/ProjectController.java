package com.fsoft.kbase.controller;

import org.springframework.security.access.prepost.PreAuthorize;

import com.fsoft.kbase.dto.request.CreateProjectRequest;
import com.fsoft.kbase.dto.request.UpdateProjectRequest;
import com.fsoft.kbase.dto.response.PagedResponse;
import com.fsoft.kbase.dto.response.ProjectResponse;
import com.fsoft.kbase.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Create and manage projects")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @Operation(summary = "Create a new project")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(userDetails.getUsername(), request));
    }

    @GetMapping
    @Operation(summary = "Get all my projects (owner + member)")
    public ResponseEntity<PagedResponse<ProjectResponse>> getMyProjects(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                projectService.getMyProjects(userDetails.getUsername(), page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project details by ID")
    public ResponseEntity<ProjectResponse> getProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.getProject(id, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update project (owner only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                projectService.updateProject(id, userDetails.getUsername(), request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete project (owner only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        projectService.deleteProject(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
