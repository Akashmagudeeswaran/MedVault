package com.medvault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MedicalRecordRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long doctorId; // Optional, set if uploaded by a doctor

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category; // Prescription, Scan, X-Ray, Blood Report, Other

    @NotNull(message = "Record date is required")
    private LocalDate recordDate;
}
