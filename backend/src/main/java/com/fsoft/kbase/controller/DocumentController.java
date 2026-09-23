package com.fsoft.kbase.controller;

import com.fsoft.kbase.dto.response.DocumentResponse;
import com.fsoft.kbase.dto.response.PagedResponse;
import com.fsoft.kbase.entity.enums.DocumentType;
import com.fsoft.kbase.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/projects/{projectId}/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Manage documents in a project")
@SecurityRequirement(name = "bearerAuth")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a document to a project")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        return ResponseEntity.ok(
                documentService.uploadDocument(projectId, userDetails.getUsername(), file, description)
        );
    }

    @GetMapping
    @Operation(summary = "Get list of documents in a project")
    public ResponseEntity<PagedResponse<DocumentResponse>> getDocuments(
            @PathVariable Long projectId,
            @RequestParam(required = false) DocumentType fileType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        return ResponseEntity.ok(
                documentService.getDocuments(projectId, userDetails.getUsername(), fileType, search, page, size)
        );
    }

    @GetMapping("/{documentId}/download")
    @Operation(summary = "Get presigned download URL for a document")
    public ResponseEntity<DocumentResponse> getDocument(
            @PathVariable Long projectId,
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        return ResponseEntity.ok(documentService.getDocument(projectId, documentId, userDetails.getUsername()));
    }

    @DeleteMapping("/{documentId}")
    @Operation(summary = "Delete a document")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long projectId,
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        documentService.deleteDocument(projectId, documentId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
