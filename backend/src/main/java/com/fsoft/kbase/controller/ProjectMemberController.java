package com.fsoft.kbase.controller;

import com.fsoft.kbase.dto.request.InviteMemberRequest;
import com.fsoft.kbase.dto.response.PagedResponse;
import com.fsoft.kbase.dto.response.ProjectMemberResponse;
import com.fsoft.kbase.service.ProjectMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/projects/{projectId}/members")
@RequiredArgsConstructor
@Tag(name = "Project Members", description = "Manage members in a project")
@SecurityRequirement(name = "bearerAuth")
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    @PostMapping
    @Operation(summary = "Invite a member to a project")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Void> inviteMember(
            @PathVariable Long projectId,
            @Valid @RequestBody InviteMemberRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        projectMemberService.inviteMember(projectId, userDetails.getUsername(), request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Remove a member from a project")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        projectMemberService.removeMember(projectId, userId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get members of a project")
    public ResponseEntity<PagedResponse<ProjectMemberResponse>> getMembers(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                projectMemberService.getMembers(projectId, userDetails.getUsername(), page, size));
    }
}
