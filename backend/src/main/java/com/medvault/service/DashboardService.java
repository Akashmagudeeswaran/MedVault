package com.medvault.service;

import com.medvault.entity.*;
import com.medvault.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private VaccinationRepository vaccinationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalPatients", patientRepository.count());
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());
        stats.put("totalMedicalRecords", medicalRecordRepository.count());

        List<Appointment> appointments = appointmentRepository.findAll();

        // Today's appointments count
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().plusDays(1).atStartOfDay();
        long todayAppts = appointments.stream()
                .filter(a -> a.getAppointmentDate().isAfter(startOfDay) && a.getAppointmentDate().isBefore(endOfDay))
                .count();
        stats.put("todayAppointments", todayAppts);

        // Pending appointments count
        long pendingAppts = appointments.stream()
                .filter(a -> a.getStatus().equalsIgnoreCase("PENDING"))
                .count();
        stats.put("pendingAppointments", pendingAppts);

        // Cancelled appointments count
        long cancelledAppts = appointments.stream()
                .filter(a -> a.getStatus().equalsIgnoreCase("CANCELLED"))
                .count();
        stats.put("cancelledAppointments", cancelledAppts);

        // Recent Audit logs (limit to 6)
        List<AuditLog> recentLogs = auditLogRepository.findAllByOrderByTimestampDesc()
                .stream().limit(6).collect(Collectors.toList());
        stats.put("recentActivities", recentLogs);

        // Chart 1: Appointments per Month
        Map<String, Long> monthlyAppointments = appointments.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getAppointmentDate().getMonth().name() + " " + a.getAppointmentDate().getYear(),
                        Collectors.counting()
                ));
        stats.put("appointmentsPerMonth", monthlyAppointments);

        // Chart 2: Disease / Record Categories (Scans, Blood Reports, etc.)
        List<MedicalRecord> records = medicalRecordRepository.findAll();
        Map<String, Long> recordsByCategory = records.stream()
                .collect(Collectors.groupingBy(MedicalRecord::getCategory, Collectors.counting()));
        stats.put("recordsByCategory", recordsByCategory);

        // Chart 3: Doctor Activity (Appointments per Doctor)
        Map<String, Long> doctorActivity = appointments.stream()
                .collect(Collectors.groupingBy(
                        a -> "Dr. " + a.getDoctor().getUser().getName(),
                        Collectors.counting()
                ));
        stats.put("doctorActivity", doctorActivity);

        // Chart 4: Patient Growth (Registrations per Month)
        List<Patient> patients = patientRepository.findAll();
        Map<String, Long> patientGrowth = patients.stream()
                .filter(p -> p.getUser() != null && p.getUser().getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getUser().getCreatedAt().getMonth().name() + " " + p.getUser().getCreatedAt().getYear(),
                        Collectors.counting()
                ));
        stats.put("patientGrowth", patientGrowth);

        // Recent Medical Records
        List<MedicalRecord> recentRecs = records.stream()
                .sorted(Comparator.comparing(MedicalRecord::getCreatedAt).reversed())
                .limit(5)
                .collect(Collectors.toList());
        stats.put("recentRecords", recentRecs);

        return stats;
    }

    public Map<String, Object> getDoctorDashboardStats(Long doctorId) {
        Map<String, Object> stats = new HashMap<>();
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().plusDays(1).atStartOfDay();

        List<Appointment> allDoctorAppointments = appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctorId);

        // Today's appointments
        List<Appointment> todayAppointments = allDoctorAppointments.stream()
                .filter(a -> a.getAppointmentDate().isAfter(startOfDay) && a.getAppointmentDate().isBefore(endOfDay))
                .sorted(Comparator.comparing(Appointment::getAppointmentDate))
                .collect(Collectors.toList());
        stats.put("todayAppointments", todayAppointments);

        // Upcoming appointments
        List<Appointment> upcomingAppointments = appointmentRepository.findUpcomingAppointmentsForDoctor(doctorId, LocalDateTime.now());
        stats.put("upcomingAppointments", upcomingAppointments);

        // Statistics
        long assignedPatients = patientRepository.findByAssignedDoctorId(doctorId).size();
        long completedAppts = allDoctorAppointments.stream().filter(a -> a.getStatus().equalsIgnoreCase("COMPLETED")).count();
        long pendingAppts = allDoctorAppointments.stream().filter(a -> a.getStatus().equalsIgnoreCase("PENDING")).count();

        stats.put("totalAssignedPatients", assignedPatients);
        stats.put("completedAppointments", completedAppts);
        stats.put("pendingAppointments", pendingAppts);

        return stats;
    }

    public Map<String, Object> getPatientDashboardStats(Long patientId) {
        Map<String, Object> stats = new HashMap<>();

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NoSuchElementException("Patient not found"));

        // Upcoming Appointments
        List<Appointment> upcoming = appointmentRepository.findUpcomingAppointmentsForPatient(patientId, LocalDateTime.now());
        stats.put("upcomingAppointments", upcoming);

        // Recent Medical Records (limit 4)
        List<MedicalRecord> recentRecords = medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId)
                .stream().limit(4).collect(Collectors.toList());
        stats.put("recentMedicalRecords", recentRecords);

        // Health Summary Details
        Map<String, Object> summary = new HashMap<>();
        summary.put("bloodGroup", patient.getBloodGroup());
        summary.put("assignedDoctor", patient.getAssignedDoctor() != null ? "Dr. " + patient.getAssignedDoctor().getUser().getName() : "None");
        
        // Latest prescription
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByDatePrescribedDesc(patientId);
        summary.put("latestPrescription", prescriptions.isEmpty() ? null : prescriptions.get(0));

        // Vaccinations
        List<Vaccination> vaccinations = vaccinationRepository.findByPatientIdOrderByDateAdministeredDesc(patientId);
        summary.put("vaccinations", vaccinations);

        stats.put("healthSummary", summary);

        return stats;
    }
}
