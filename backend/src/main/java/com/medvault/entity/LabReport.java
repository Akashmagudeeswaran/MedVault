package com.medvault.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "lab_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "medicalRecord")
public class LabReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id", nullable = false)
    @JsonIgnore
    private MedicalRecord medicalRecord;

    @NotBlank
    @Column(name = "test_name", nullable = false, length = 150)
    private String testName;

    @NotNull
    @Column(name = "test_date", nullable = false)
    private LocalDate testDate;

    @Column(columnDefinition = "TEXT")
    private String results;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String status; // PENDING, COMPLETED

    @Column(name = "file_path", length = 255)
    private String filePath;
}
