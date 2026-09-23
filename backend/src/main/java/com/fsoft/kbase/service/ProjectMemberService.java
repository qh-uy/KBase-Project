package com.fsoft.kbase.service;

import com.fsoft.kbase.dto.request.InviteMemberRequest;
import com.fsoft.kbase.dto.response.PagedResponse;
import com.fsoft.kbase.dto.response.ProjectMemberResponse;

public interface ProjectMemberService {
    void inviteMember(Long projectId, String ownerEmail, InviteMemberRequest request);
    void acceptInvitation(Long projectId, String userEmail);
    void removeMember(Long projectId, Long userId, String ownerEmail);
    PagedResponse<ProjectMemberResponse> getMembers(Long projectId, String userEmail, int page, int size);
}
