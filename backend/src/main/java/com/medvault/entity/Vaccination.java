package com.medvault.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "vaccinations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vaccination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotBlank
    @Column(name = "vaccine_name", nullable = false, length = 100)
    private String vaccineName;

    @NotNull
    @Column(name = "date_administered", nullable = false)
    private LocalDate dateAdministered;

    @Column(name = "administered_by", length = 100)
    private String administeredBy;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;
}
