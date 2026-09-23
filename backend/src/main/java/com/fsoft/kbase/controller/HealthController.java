package com.fsoft.kbase.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/health")
@Tag(name = "Health", description = "Health check endpoint")
public class HealthController {

    @GetMapping
    @Operation(summary = "Health check — used to prevent Render cold start")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "KBase API",
                "version", "1.0.0",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
