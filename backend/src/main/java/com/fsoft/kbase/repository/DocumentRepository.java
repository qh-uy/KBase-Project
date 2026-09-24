package com.fsoft.kbase.repository;

import com.fsoft.kbase.entity.Document;
import com.fsoft.kbase.entity.enums.DocumentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Query("SELECT d FROM Document d WHERE d.project.id = :projectId " +
           "AND (cast(:fileType as text) IS NULL OR d.fileType = :fileType) " +
           "AND (cast(:search as text) IS NULL OR LOWER(d.originalName) LIKE LOWER(CONCAT('%', cast(:search as text), '%')))")
    Page<Document> findByProjectId(
            @Param("projectId") Long projectId,
            @Param("fileType") DocumentType fileType,
            @Param("search") String search,
            Pageable pageable);

    boolean existsByProjectIdAndMinioKey(Long projectId, String minioKey);

    @Query("SELECT SUM(d.fileSize) FROM Document d WHERE d.project.id = :projectId")
    Long sumFileSizeByProjectId(@Param("projectId") Long projectId);
}
