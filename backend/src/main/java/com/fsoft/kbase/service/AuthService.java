package com.fsoft.kbase.service;

import com.fsoft.kbase.dto.request.LoginRequest;
import com.fsoft.kbase.dto.request.RegisterRequest;
import com.fsoft.kbase.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    void logout(String refreshToken);
}
