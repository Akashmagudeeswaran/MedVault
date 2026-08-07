package com.medvault.service;

import com.medvault.dto.*;
import com.medvault.entity.*;
import com.medvault.exception.BadRequestException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.*;
import com.medvault.config.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public AuthResponse login(LoginRequest loginRequest, String ipAddress) {
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + loginRequest.getEmail()));

        // Double check role portal matching if specified
        if (loginRequest.getRole() != null && !user.getRole().name().equals(loginRequest.getRole())) {
            throw new BadRequestException("Role mismatch. You are not authorized to login to this portal.");
        }

        Long profileId = null;
        if (user.getRole() == UserRole.ROLE_PATIENT) {
            Patient patient = patientRepository.findByUserId(user.getId()).orElse(null);
            if (patient != null) profileId = patient.getId();
        } else if (user.getRole() == UserRole.ROLE_DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(user.getId()).orElse(null);
            if (doctor != null) profileId = doctor.getId();
        }

        // Log to Audit table
        auditLogService.log(user.getEmail(), "USER_LOGIN", "Successful login to portal", ipAddress);

        return AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .profileId(profileId)
                .build();
    }

    @Transactional
    public void registerPatient(RegisterRequest registerRequest, String ipAddress) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email address already in use.");
        }

        // Create User entity
        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(UserRole.ROLE_PATIENT)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        // Create Patient entity
        Patient patient = Patient.builder()
                .user(savedUser)
                .dateOfBirth(registerRequest.getDateOfBirth())
                .gender(registerRequest.getGender())
                .phone(registerRequest.getPhone())
                .bloodGroup(registerRequest.getBloodGroup())
                .address(registerRequest.getAddress())
                .emergencyContact(registerRequest.getEmergencyContact())
                .build();

        patientRepository.save(patient);

        // Audit Log
        auditLogService.log(savedUser.getEmail(), "PATIENT_REGISTER", "New patient self-registration", ipAddress);

        // Security Notification
        notificationService.createNotification(savedUser, "Registration Successful", 
                "Welcome to MedVault. Your patient account has been created successfully.", "SECURITY");
    }

    @Transactional
    public String initiatePasswordReset(ForgotPasswordRequest request, String ipAddress) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        // Simulate password reset token generation
        String resetToken = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        auditLogService.log(user.getEmail(), "PASSWORD_RESET_REQUEST", "Initiated password reset process. Token generated.", ipAddress);
        notificationService.createNotification(user, "Password Reset Initiated", 
                "A password reset request was initiated. Use the verification token to reset your password: " + resetToken, "SECURITY");
        
        return resetToken; // Return the token so the dev can see/test it locally without a real SMTP server
    }

    @Transactional
    public void executePasswordReset(ResetPasswordRequest request, String ipAddress) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        // In a real application, we would validate the reset token against a store.
        // For development/mock purposes, we assume validity and change the password.
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.log(user.getEmail(), "PASSWORD_RESET_COMPLETE", "Successfully reset account password.", ipAddress);
        notificationService.createNotification(user, "Password Changed", "Your password has been changed successfully. If you did not do this, please contact support immediately.", "SECURITY");
    }
}
