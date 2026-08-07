package com.medvault.controller;

import com.medvault.dto.AuthResponse;
import com.medvault.dto.ForgotPasswordRequest;
import com.medvault.dto.LoginRequest;
import com.medvault.dto.RegisterRequest;
import com.medvault.dto.ResetPasswordRequest;
import com.medvault.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        AuthResponse response = authService.login(loginRequest, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        authService.registerPatient(registerRequest, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Patient registered successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotRequest, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String token = authService.initiatePasswordReset(forgotRequest, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset initiated successfully");
        response.put("token", token); // Return token for dev testing convenience
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest resetRequest, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        authService.executePasswordReset(resetRequest, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successful");
        return ResponseEntity.ok(response);
    }
}
