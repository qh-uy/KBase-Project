package com.fsoft.kbase.service.impl;

import com.fsoft.kbase.dto.response.DocumentResponse;
import com.fsoft.kbase.dto.response.PagedResponse;
import com.fsoft.kbase.dto.response.UserResponse;
import com.fsoft.kbase.entity.Document;
import com.fsoft.kbase.entity.Project;
import com.fsoft.kbase.entity.User;
import com.fsoft.kbase.entity.enums.DocumentType;
import com.fsoft.kbase.exception.ResourceNotFoundException;
import com.fsoft.kbase.exception.SystemException;
import com.fsoft.kbase.repository.DocumentRepository;
import com.fsoft.kbase.repository.ProjectMemberRepository;
import com.fsoft.kbase.repository.ProjectRepository;
import com.fsoft.kbase.repository.UserRepository;
import com.fsoft.kbase.service.DocumentService;
import com.fsoft.kbase.service.MinioService;
import com.fsoft.kbase.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.DecimalFormat;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final MinioService minioService;

    @Value("${app.upload.allowed-document-types}")
    private String[] allowedDocTypes;

    @Value("${app.upload.allowed-image-types}")
    private String[] allowedImageTypes;

    @Value("${app.upload.allowed-video-types}")
    private String[] allowedVideoTypes;

    @Override
    @Transactional
    public DocumentResponse uploadDocument(Long projectId, String userEmail, MultipartFile file, String description) {
        Project project = getActiveProject(projectId);
        User user = getUserByEmail(userEmail);
        
        // Ensure user is member or owner or admin
        boolean isAdmin = user.getRole().getName().name().equals("ADMIN");
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId());

        if (!isAdmin && !isOwner && !isMember) {
            throw new AccessDeniedException("You do not have permission to upload documents to this project.");
        }

        String originalName = file.getOriginalFilename();
        String extension = getExtension(originalName);
        
        DocumentType docType = determineDocumentType(extension);

        // Format path: projects/{projectId}/documents/UUID.ext
        String objectName = minioService.uploadFile(file, "projects/" + projectId + "/documents");

        Document document = Document.builder()
                .project(project)
                .uploadedBy(user)
                .originalName(originalName)
                .fileName(objectName.substring(objectName.lastIndexOf("/") + 1))
                .minioBucket(minioService.getBucketName())
                .minioKey(objectName)
                .fileType(docType)
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .description(description)
                .downloadCount(0)
                .build();

        documentRepository.save(document);

        return toResponse(document, minioService.getPresignedUrl(objectName));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DocumentResponse> getDocuments(Long projectId, String userEmail, DocumentType fileType, String search, int page, int size) {
        Project project = getActiveProject(projectId);
        User user = getUserByEmail(userEmail);
        
        boolean isAdmin = user.getRole().getName().name().equals("ADMIN");
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId());

        if (!isAdmin && !isOwner && !isMember) {
            throw new AccessDeniedException("You do not have permission to view documents in this project.");
        }

        Pageable pageable = PaginationUtils.buildPageable(page, size, "createdAt", "desc");
        Page<Document> documents = documentRepository.findByProjectId(projectId, fileType, search, pageable);
        
        return PaginationUtils.buildResponse(documents.map(d -> toResponse(d, minioService.getPresignedUrl(d.getMinioKey()))));
    }

    @Override
    @Transactional
    public DocumentResponse getDocument(Long projectId, Long documentId, String userEmail) {
        Project project = getActiveProject(projectId);
        User user = getUserByEmail(userEmail);
        
        boolean isAdmin = user.getRole().getName().name().equals("ADMIN");
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId());

        if (!isAdmin && !isOwner && !isMember) {
            throw new AccessDeniedException("You do not have permission to view this document.");
        }

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        if (!document.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Document not found in this project");
        }

        // Increment download count (even for view)
        document.setDownloadCount(document.getDownloadCount() + 1);
        documentRepository.save(document);

        return toResponse(document, minioService.getPresignedUrl(document.getMinioKey()));
    }

    @Override
    @Transactional
    public void deleteDocument(Long projectId, Long documentId, String userEmail) {
        Project project = getActiveProject(projectId);
        User user = getUserByEmail(userEmail);
        
        boolean isAdmin = user.getRole().getName().name().equals("ADMIN");
        boolean isOwner = project.getOwner().getId().equals(user.getId());

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        if (!document.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Document not found in this project");
        }

        // Only Admin, Owner, or the Uploader can delete
        if (!isAdmin && !isOwner && !document.getUploadedBy().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to delete this document.");
        }

        // Delete from MinIO
        minioService.deleteFile(document.getMinioKey());

        // Delete from DB
        documentRepository.delete(document);
    }

    @Override
    @Transactional
    public ResponseEntity<byte[]> proxyDownload(Long projectId, Long documentId, String userEmail) {
        Project project = getActiveProject(projectId);
        User user = getUserByEmail(userEmail);

        boolean isAdmin = user.getRole().getName().name().equals("ADMIN");
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId());

        if (!isAdmin && !isOwner && !isMember) {
            throw new AccessDeniedException("You do not have permission to download this document.");
        }

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        if (!document.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Document not found in this project");
        }

        // Increment download count
        document.setDownloadCount(document.getDownloadCount() + 1);
        documentRepository.save(document);

        // Fetch file from Cloudinary and stream it back
        try {
            String fileUrl = minioService.getPresignedUrl(document.getMinioKey());
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fileUrl))
                    .GET()
                    .build();
            HttpResponse<byte[]> response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());

            String mimeType = document.getMimeType() != null ? document.getMimeType() : "application/octet-stream";
            String filename = document.getOriginalName() != null ? document.getOriginalName() : document.getFileName();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(mimeType));
            headers.setContentDisposition(
                    ContentDisposition.attachment().filename(filename).build()
            );
            headers.setContentLength(response.body().length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(response.body());

        } catch (Exception e) {
            log.error("Failed to proxy download document id={}: {}", documentId, e.getMessage());
            throw new SystemException("Failed to download file: " + e.getMessage());
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private DocumentType determineDocumentType(String extension) {
        if (Arrays.asList(allowedImageTypes).contains(extension)) {
            return DocumentType.IMAGE;
        } else if (Arrays.asList(allowedVideoTypes).contains(extension)) {
            return DocumentType.VIDEO;
        } else if (Arrays.asList(allowedDocTypes).contains(extension)) {
            return DocumentType.DOCUMENT;
        }
        throw new SystemException("File type not allowed: " + extension);
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

    private DocumentResponse toResponse(Document document, String downloadUrl) {
        UserResponse uploader = UserResponse.builder()
                .id(document.getUploadedBy().getId())
                .email(document.getUploadedBy().getEmail())
                .fullName(document.getUploadedBy().getFullName())
                .avatarUrl(document.getUploadedBy().getAvatarUrl())
                .role(document.getUploadedBy().getRole().getName().name())
                .build();

        return DocumentResponse.builder()
                .id(document.getId())
                .projectId(document.getProject().getId())
                .originalName(document.getOriginalName())
                .fileName(document.getFileName())
                .fileType(document.getFileType().name())
                .mimeType(document.getMimeType())
                .fileSize(document.getFileSize())
                .fileSizeFormatted(formatFileSize(document.getFileSize()))
                .description(document.getDescription())
                .downloadUrl(downloadUrl)
                .downloadCount(document.getDownloadCount())
                .uploadedBy(uploader)
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }

    private String formatFileSize(long size) {
        if (size <= 0) return "0 B";
        final String[] units = new String[]{"B", "KB", "MB", "GB", "TB"};
        int digitGroups = (int) (Math.log10(size) / Math.log10(1024));
        return new DecimalFormat("#,##0.#").format(size / Math.pow(1024, digitGroups)) + " " + units[digitGroups];
    }
}
