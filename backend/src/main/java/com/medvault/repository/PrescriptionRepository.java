package com.medvault.repository;

import com.medvault.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientIdOrderByDatePrescribedDesc(Long patientId);
    List<Prescription> findByDoctorIdOrderByDatePrescribedDesc(Long doctorId);
    Optional<Prescription> findByAppointmentId(Long appointmentId);
}
