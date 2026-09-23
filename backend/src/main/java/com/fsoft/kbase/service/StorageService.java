package com.fsoft.kbase.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface StorageService {
    String uploadFile(String bucket, String objectKey, MultipartFile file);
    void deleteFile(String bucket, String objectKey);
    String generatePresignedUrl(String bucket, String objectKey, int expiryMinutes);
    InputStream downloadFile(String bucket, String objectKey);
    void ensureBucketExists(String bucketName);
}
