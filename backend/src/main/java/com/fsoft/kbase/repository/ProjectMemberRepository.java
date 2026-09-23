package com.fsoft.kbase.repository;

import com.fsoft.kbase.entity.ProjectMember;
import com.fsoft.kbase.entity.enums.MemberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);

    Page<ProjectMember> findByProjectIdAndStatus(Long projectId, MemberStatus status, Pageable pageable);
    
    Page<ProjectMember> findByProjectId(Long projectId, Pageable pageable);

    @Modifying
    @Query("DELETE FROM ProjectMember m WHERE m.project.id = :projectId AND m.user.id = :userId")
    void deleteByProjectIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);

    boolean existsByProjectIdAndUserIdAndStatus(Long projectId, Long userId, MemberStatus status);
}
