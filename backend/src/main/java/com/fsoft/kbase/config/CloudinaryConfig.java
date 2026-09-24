package com.fsoft.kbase.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    // Support both CLOUDINARY_URL (e.g. cloudinary://key:secret@cloud)
    // and individual vars as fallback
    @Value("${CLOUDINARY_URL:}")
    private String cloudinaryUrl;

    @Value("${app.cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudinaryUrl != null && !cloudinaryUrl.isBlank()) {
            // Cloudinary SDK parses "cloudinary://key:secret@cloud" natively
            return new Cloudinary(cloudinaryUrl);
        }
        // Fallback to individual env vars
        return new Cloudinary(
            "cloudinary://" + apiKey + ":" + apiSecret + "@" + cloudName
        );
    }
}
