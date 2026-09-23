package com.fsoft.kbase.service;

import com.fsoft.kbase.dto.request.UpdateProfileRequest;
import com.fsoft.kbase.dto.response.PagedResponse;
import com.fsoft.kbase.dto.response.UserResponse;

public interface UserService {
    UserResponse getCurrentUser(String email);
    UserResponse updateProfile(String email, UpdateProfileRequest request);
    PagedResponse<UserResponse> getAllUsers(int page, int size, String search);
    void deactivateUser(Long userId);
}
