package com.fsoft.kbase.service;

import org.springframework.web.multipart.MultipartFile;

public interface MinioService {
    String uploadFile(MultipartFile file, String pathPrefix);
    String getPresignedUrl(String objectName);
    void deleteFile(String objectName);
    String getBucketName();
}
