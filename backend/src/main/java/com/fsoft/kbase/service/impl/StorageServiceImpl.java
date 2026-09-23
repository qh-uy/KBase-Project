package com.fsoft.kbase.service.impl;

import com.fsoft.kbase.exception.FileStorageException;
import com.fsoft.kbase.service.StorageService;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageServiceImpl implements StorageService {

    private final MinioClient minioClient;

    @Override
    public String uploadFile(String bucket, String objectKey, MultipartFile file) {
        try {
            ensureBucketExists(bucket);
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
            log.info("File uploaded to MinIO: {}/{}", bucket, objectKey);
            return objectKey;
        } catch (Exception e) {
            throw new FileStorageException("Failed to upload file: " + file.getOriginalFilename(), e);
        }
    }

    @Override
    public void deleteFile(String bucket, String objectKey) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .build());
            log.info("File deleted from MinIO: {}/{}", bucket, objectKey);
        } catch (Exception e) {
            throw new FileStorageException("Failed to delete file: " + objectKey, e);
        }
    }

    @Override
    public String generatePresignedUrl(String bucket, String objectKey, int expiryMinutes) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .method(Method.GET)
                    .expiry(expiryMinutes, TimeUnit.MINUTES)
                    .build());
        } catch (Exception e) {
            throw new FileStorageException("Failed to generate presigned URL for: " + objectKey, e);
        }
    }

    @Override
    public InputStream downloadFile(String bucket, String objectKey) {
        try {
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .build());
        } catch (Exception e) {
            throw new FileStorageException("Failed to download file: " + objectKey, e);
        }
    }

    @Override
    public void ensureBucketExists(String bucketName) {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(bucketName).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("MinIO bucket created: {}", bucketName);
            }
        } catch (Exception e) {
            throw new FileStorageException("Failed to ensure bucket exists: " + bucketName, e);
        }
    }
}
