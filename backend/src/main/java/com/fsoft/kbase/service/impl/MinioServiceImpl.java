package com.fsoft.kbase.service.impl;

import com.fsoft.kbase.exception.SystemException;
import com.fsoft.kbase.service.MinioService;
import io.minio.*;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;

    @Value("${app.minio.bucket-name}")
    private String bucketName;

    @PostConstruct
    public void init() {
        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("MinIO bucket '{}' created successfully.", bucketName);
            } else {
                log.info("MinIO bucket '{}' already exists.", bucketName);
            }
        } catch (Exception e) {
            log.error("Error occurred while checking/creating bucket: ", e);
            throw new SystemException("Could not initialize MinIO bucket");
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String pathPrefix) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            
            // Format: prefix/UUID.ext
            String objectName = pathPrefix + "/" + UUID.randomUUID() + extension;

            InputStream inputStream = file.getInputStream();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            log.info("File uploaded successfully to MinIO as: {}", objectName);
            return objectName;
        } catch (Exception e) {
            log.error("Failed to upload file to MinIO: ", e);
            throw new SystemException("Failed to upload file to storage.");
        }
    }

    @Override
    public String getPresignedUrl(String objectName) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(1, TimeUnit.HOURS)
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to get presigned URL from MinIO for object: {}", objectName, e);
            throw new SystemException("Failed to generate download link.");
        }
    }

    @Override
    public void deleteFile(String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            log.info("File deleted successfully from MinIO: {}", objectName);
        } catch (Exception e) {
            log.error("Failed to delete file from MinIO: {}", objectName, e);
            throw new SystemException("Failed to delete file from storage.");
        }
    }

    @Override
    public String getBucketName() {
        return bucketName;
    }
}
