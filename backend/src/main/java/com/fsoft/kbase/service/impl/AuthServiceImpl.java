package com.fsoft.kbase.service.impl;

import com.fsoft.kbase.dto.request.LoginRequest;
import com.fsoft.kbase.dto.request.RegisterRequest;
import com.fsoft.kbase.dto.response.AuthResponse;
import com.fsoft.kbase.dto.response.UserResponse;
import com.fsoft.kbase.entity.RefreshToken;
import com.fsoft.kbase.entity.Role;
import com.fsoft.kbase.entity.User;
import com.fsoft.kbase.entity.enums.RoleType;
import com.fsoft.kbase.exception.DuplicateResourceException;
import com.fsoft.kbase.exception.ResourceNotFoundException;
import com.fsoft.kbase.repository.RefreshTokenRepository;
import com.fsoft.kbase.repository.RoleRepository;
import com.fsoft.kbase.repository.UserRepository;
import com.fsoft.kbase.security.JwtTokenProvider;
import com.fsoft.kbase.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        Role userRole = roleRepository.findByName(RoleType.USER)
                .orElseThrow(() -> new ResourceNotFoundException("Default USER role not found. Run Flyway migrations."));

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(userRole)
                .isActive(true)
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Delete old refresh tokens
        refreshTokenRepository.deleteByUserId(user.getId());

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));

        if (storedToken.isExpired()) {
            refreshTokenRepository.delete(storedToken);
            throw new RuntimeException("Refresh token has expired. Please login again.");
        }

        User user = storedToken.getUser();
        refreshTokenRepository.delete(storedToken);

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(refreshTokenRepository::delete);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtTokenProvider.generateAccessToken(user);
        String refreshTokenStr = jwtTokenProvider.generateRefreshToken(user);

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiryDate(LocalDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000))
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().getName().name())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs())
                .user(userResponse)
                .build();
    }
}
