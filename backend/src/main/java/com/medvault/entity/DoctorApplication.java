package com.medvault.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String password;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String hospital;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String specialization;

    @Column(name = "mbbs_certificate_path", nullable = true, length = 255)
    private String mbbsCertificatePath;

    @Column(name = "experience_certificate_path", nullable = true, length = 255)
    private String experienceCertificatePath;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
