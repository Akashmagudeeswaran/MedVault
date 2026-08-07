package com.medvault.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ProfileUpdateRequest {
    // Shared
    private String name;
    private String email;
    private String phone;

    // Patient Specific
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;
    private String emergencyContact;

    // Doctor Specific
    private String specialization;
    private String licenseNumber;
    private String department;
    private String bio;
}
