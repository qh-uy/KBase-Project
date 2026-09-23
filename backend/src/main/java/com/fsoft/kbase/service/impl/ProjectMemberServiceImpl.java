package com.fsoft.kbase.service.impl;

import com.fsoft.kbase.dto.request.InviteMemberRequest;
import com.fsoft.kbase.dto.response.PagedResponse;
import com.fsoft.kbase.dto.response.ProjectMemberResponse;
import com.fsoft.kbase.dto.response.UserResponse;
import com.fsoft.kbase.entity.Project;
import com.fsoft.kbase.entity.ProjectMember;
import com.fsoft.kbase.entity.User;
import com.fsoft.kbase.entity.enums.MemberStatus;
import com.fsoft.kbase.exception.DuplicateResourceException;
import com.fsoft.kbase.exception.ResourceNotFoundException;
import com.fsoft.kbase.repository.ProjectMemberRepository;
import com.fsoft.kbase.repository.ProjectRepository;
import com.fsoft.kbase.repository.UserRepository;
import com.fsoft.kbase.service.ProjectMemberService;
import com.fsoft.kbase.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectMemberServiceImpl implements ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void inviteMember(Long projectId, String ownerEmail, InviteMemberRequest request) {
        Project project = getActiveProject(projectId);
        User owner = getUserByEmail(ownerEmail);
        
        // ADMIN or OWNER can invite
        if (!project.getOwner().getId().equals(owner.getId()) && !owner.getRole().getName().name().equals("ADMIN")) {
            throw new AccessDeniedException("Only the project owner or ADMIN can invite members.");
        }

        User invitee = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (project.getOwner().getId().equals(invitee.getId())) {
            throw new DuplicateResourceException("User is already the owner of this project.");
        }

        projectMemberRepository.findByProjectIdAndUserId(projectId, invitee.getId())
                .ifPresent(m -> {
                    if (m.getStatus() == MemberStatus.ACTIVE) {
                        throw new DuplicateResourceException("User is already an active member.");
                    } else if (m.getStatus() == MemberStatus.PENDING) {
                        throw new DuplicateResourceException("User is already invited (PENDING).");
                    }
                });

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(invitee)
                .status(MemberStatus.ACTIVE) // For simplicity, instantly active in this demo
                .joinedAt(java.time.LocalDateTime.now())
                .build();

        projectMemberRepository.save(member);
        log.info("User {} invited to project {}", request.getEmail(), projectId);
    }

    @Override
    @Transactional
    public void acceptInvitation(Long projectId, String userEmail) {
        // Not used right now since we auto-active
    }

    @Override
    @Transactional
    public void removeMember(Long projectId, Long userId, String ownerEmail) {
        Project project = getActiveProject(projectId);
        User owner = getUserByEmail(ownerEmail);

        if (!project.getOwner().getId().equals(owner.getId()) && !owner.getRole().getName().name().equals("ADMIN")) {
            throw new AccessDeniedException("Only the project owner or ADMIN can remove members.");
        }

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectMember not found"));

        projectMemberRepository.delete(member);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProjectMemberResponse> getMembers(Long projectId, String userEmail, int page, int size) {
        Project project = getActiveProject(projectId);
        // Ensure user is member or owner or admin
        User user = getUserByEmail(userEmail);
        boolean isAdmin = user.getRole().getName().name().equals("ADMIN");
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isMember = projectMemberRepository.findByProjectIdAndUserId(projectId, user.getId()).isPresent();
        
        if (!isAdmin && !isOwner && !isMember) {
            throw new AccessDeniedException("You do not have permission to view members of this project.");
        }

        Pageable pageable = PaginationUtils.buildPageable(page, size, "joinedAt", "desc");
        Page<ProjectMember> members = projectMemberRepository.findByProjectId(projectId, pageable);

        return PaginationUtils.buildResponse(members.map(this::toResponse));
    }

    private Project getActiveProject(Long projectId) {
        return projectRepository.findById(projectId)
                .filter(Project::getIsActive)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private ProjectMemberResponse toResponse(ProjectMember member) {
        return ProjectMemberResponse.builder()
                .id(member.getId())
                .userId(member.getUser().getId())
                .fullName(member.getUser().getFullName())
                .email(member.getUser().getEmail())
                .avatarUrl(member.getUser().getAvatarUrl())
                .status(member.getStatus().name())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
