package com.fsoft.kbase.util;

import com.fsoft.kbase.entity.enums.DocumentType;
import org.springframework.web.multipart.MultipartFile;

import java.text.DecimalFormat;
import java.util.Set;

public final class FileUtils {

    private static final Set<String> DOCUMENT_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "md", "txt");
    private static final Set<String> IMAGE_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "svg", "bmp", "webp");
    private static final Set<String> VIDEO_EXTENSIONS = Set.of(
            "mp4", "mov", "avi", "webm");

    private FileUtils() {}

    public static String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    public static DocumentType detectDocumentType(String filename) {
        String ext = getExtension(filename);
        if (DOCUMENT_EXTENSIONS.contains(ext)) return DocumentType.DOCUMENT;
        if (IMAGE_EXTENSIONS.contains(ext))    return DocumentType.IMAGE;
        if (VIDEO_EXTENSIONS.contains(ext))    return DocumentType.VIDEO;
        throw new IllegalArgumentException("Unsupported file type: " + ext);
    }

    public static boolean isAllowed(MultipartFile file) {
        String ext = getExtension(file.getOriginalFilename());
        return DOCUMENT_EXTENSIONS.contains(ext)
                || IMAGE_EXTENSIONS.contains(ext)
                || VIDEO_EXTENSIONS.contains(ext);
    }

    public static String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        DecimalFormat df = new DecimalFormat("#.##");
        if (bytes < 1024 * 1024) return df.format(bytes / 1024.0) + " KB";
        if (bytes < 1024 * 1024 * 1024) return df.format(bytes / (1024.0 * 1024)) + " MB";
        return df.format(bytes / (1024.0 * 1024 * 1024)) + " GB";
    }
}
