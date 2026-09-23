package com.fsoft.kbase;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class KBaseApplication {
    public static void main(String[] args) {
        SpringApplication.run(KBaseApplication.class, args);
    }
}
