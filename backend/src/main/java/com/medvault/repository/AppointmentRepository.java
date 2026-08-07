package com.medvault.repository;

import com.medvault.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(Long patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateDesc(Long doctorId);
    
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate BETWEEN :start AND :end ORDER BY a.appointmentDate ASC")
    List<Appointment> findAppointmentsForDoctorInPeriod(
            @Param("doctorId") Long doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.appointmentDate >= :now AND a.status IN ('PENDING', 'APPROVED') ORDER BY a.appointmentDate ASC")
    List<Appointment> findUpcomingAppointmentsForPatient(@Param("patientId") Long patientId, @Param("now") LocalDateTime now);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate >= :now AND a.status IN ('PENDING', 'APPROVED') ORDER BY a.appointmentDate ASC")
    List<Appointment> findUpcomingAppointmentsForDoctor(@Param("doctorId") Long doctorId, @Param("now") LocalDateTime now);

    boolean existsByDoctorIdAndAppointmentDateAndStatusNotIn(Long doctorId, LocalDateTime appointmentDate, java.util.Collection<String> statuses);

    long countByStatus(String status);
}
