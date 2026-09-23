package com.fsoft.kbase.service.impl;

import com.fsoft.kbase.dto.request.UpdateProfileRequest;
import com.fsoft.kbase.dto.response.PagedResponse;
import com.fsoft.kbase.dto.response.UserResponse;
import com.fsoft.kbase.entity.User;
import com.fsoft.kbase.exception.ResourceNotFoundException;
import com.fsoft.kbase.repository.UserRepository;
import com.fsoft.kbase.service.UserService;
import com.fsoft.kbase.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(int page, int size, String search) {
        Pageable pageable = PaginationUtils.buildPageable(page, size, "createdAt", "desc");
        Page<User> users;
        
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(search, search, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        
        return PaginationUtils.buildResponse(users.map(this::toResponse));
    }

    @Override
    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setIsActive(!user.getIsActive()); // Toggle active status
        userRepository.save(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().getName().name())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
