package com.fsoft.kbase.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fsoft.kbase.exception.SystemException;
import com.fsoft.kbase.service.MinioService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioServiceImpl implements MinioService {

    private final Cloudinary cloudinary;

    @Value("${app.cloudinary.cloud-name}")
    private String cloudName;

    private static final String BUCKET_NAME = "kbase";

    @PostConstruct
    public void init() {
        log.info("Cloudinary storage initialized. Cloud: {}", cloudName);
    }

    @Override
    public String uploadFile(MultipartFile file, String pathPrefix) {
        try {
            String publicId = pathPrefix.replace("/", "_") + "_" + UUID.randomUUID();

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "folder",    "kbase/" + pathPrefix,
                            "resource_type", "auto"   // handles PDF, images, videos, docs
                    )
            );

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("File uploaded to Cloudinary: {}", secureUrl);
            // Return the public_id so we can delete later; prefix with "url:" to distinguish
            return "url:" + secureUrl + "|id:" + uploadResult.get("public_id");
        } catch (Exception e) {
            log.error("Failed to upload file to Cloudinary", e);
            throw new SystemException("Failed to upload file to storage: " + e.getMessage());
        }
    }

    @Override
    public String getPresignedUrl(String objectName) {
        // objectName was stored as "url:<url>|id:<publicId>" or plain URL
        if (objectName == null) return null;
        if (objectName.startsWith("url:")) {
            return objectName.substring(4, objectName.indexOf("|id:"));
        }
        // Legacy / plain URL fallback
        return objectName;
    }

    @Override
    public void deleteFile(String objectName) {
        try {
            if (objectName != null && objectName.startsWith("url:") && objectName.contains("|id:")) {
                String publicId = objectName.substring(objectName.indexOf("|id:") + 4);
                cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "auto"));
                log.info("File deleted from Cloudinary: {}", publicId);
            }
        } catch (Exception e) {
            log.warn("Failed to delete file from Cloudinary: {}", e.getMessage());
        }
    }

    @Override
    public String getBucketName() {
        return BUCKET_NAME;
    }
}
