package com.fsoft.kbase.config;

import com.fsoft.kbase.entity.Role;
import com.fsoft.kbase.entity.User;
import com.fsoft.kbase.entity.enums.RoleType;
import com.fsoft.kbase.repository.RoleRepository;
import com.fsoft.kbase.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
    }

    private void seedUsers() {
        // Bỏ kiểm tra count() > 0 để luôn kiểm tra và tạo 3 tài khoản mặc định nếu chưa có
        log.info("Checking default users...");

        log.info("Seeding default users...");

        // Ensure roles exist before creating users
        Role adminRole = getRole(RoleType.ADMIN);
        Role ownerRole = getRole(RoleType.OWNER);
        Role userRole = getRole(RoleType.USER);

        if (adminRole == null || ownerRole == null || userRole == null) {
            log.error("Roles are missing in database. Make sure Flyway V2__seed_roles.sql ran successfully.");
            return;
        }

        // Create Admin
        createUser("admin@kbase.com", "Admin System", adminRole);
        // Create Owner
        createUser("owner@kbase.com", "Project Owner", ownerRole);
        // Create User
        createUser("user@kbase.com", "Regular User", userRole);

        log.info("Default users seeded successfully! Password for all is: 123456");
    }

    private Role getRole(RoleType roleType) {
        Optional<Role> roleOpt = roleRepository.findByName(roleType);
        return roleOpt.orElse(null);
    }

    private void createUser(String email, String fullName, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode("123456")) // Mật khẩu chung là 123456
                    .fullName(fullName)
                    .role(role)
                    .isActive(true)
                    .build();
            userRepository.save(user);
            log.info("Created user: {} with role: {}", email, role.getName());
        }
    }
}
