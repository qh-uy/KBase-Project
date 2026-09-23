package com.fsoft.kbase.repository;

import com.fsoft.kbase.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findBySlugAndIsActiveTrue(String slug);

    boolean existsBySlug(String slug);

    // Lấy các project mà user là Owner hoặc Member (ACTIVE)
    @Query("SELECT DISTINCT p FROM Project p " +
           "LEFT JOIN p.members m " +
           "WHERE p.isActive = true AND " +
           "(p.owner.id = :userId OR (m.user.id = :userId AND m.status = 'ACTIVE'))")
    Page<Project> findProjectsByUserId(@Param("userId") Long userId, Pageable pageable);

    // Admin: tất cả projects
    Page<Project> findByIsActiveTrue(Pageable pageable);

    // Đếm số document trong project
    @Query("SELECT COUNT(d) FROM Document d WHERE d.project.id = :projectId")
    long countDocuments(@Param("projectId") Long projectId);

    // Đếm số member ACTIVE trong project
    @Query("SELECT COUNT(m) FROM ProjectMember m WHERE m.project.id = :projectId AND m.status = 'ACTIVE'")
    long countActiveMembers(@Param("projectId") Long projectId);
}
