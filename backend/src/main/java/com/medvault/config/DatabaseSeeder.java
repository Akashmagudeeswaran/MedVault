package com.medvault.config;

import com.medvault.entity.*;
import com.medvault.repository.*;
import com.medvault.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE doctor_applications MODIFY mbbs_certificate_path VARCHAR(255) NULL");
            jdbcTemplate.execute("ALTER TABLE doctor_applications MODIFY experience_certificate_path VARCHAR(255) NULL");
        } catch (Exception e) {
            System.err.println("Could not alter doctor_applications table column nullability constraints: " + e.getMessage());
        }
        seedAdminUser();
        seedDoctorsAndPatients();
        seedAuditLogs();
    }

    private void seedAdminUser() {
        String adminEmail = "admin@gmail.com";
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin == null) {
            admin = User.builder()
                    .name("System Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin@312"))
                    .role(UserRole.ROLE_ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            auditLogService.log(adminEmail, "SYSTEM_SEED", "Default Super Admin seeded.", "127.0.0.1");
        } else {
            admin.setPassword(passwordEncoder.encode("Admin@312"));
            userRepository.save(admin);
        }
    }

    private void seedDoctorsAndPatients() {
        String doc1Email = "sarah.jenkins@medvault.com";
        String doc2Email = "robert.chen@medvault.com";
        String patient1Email = "john.doe@gmail.com";
        String patient2Email = "jane.smith@gmail.com";

        String defaultPass = passwordEncoder.encode("User@123");

        // Seed Doctor 1
        Doctor doctor1 = null;
        User user1 = userRepository.findByEmail(doc1Email).orElse(null);
        if (user1 == null) {
            User user = User.builder()
                    .name("Dr. Sarah Jenkins")
                    .email(doc1Email)
                    .password(defaultPass)
                    .role(UserRole.ROLE_DOCTOR)
                    .enabled(true)
                    .build();

            doctor1 = Doctor.builder()
                    .user(user)
                    .specialization("Cardiology")
                    .licenseNumber("LIC-1002345")
                    .phone("+1-555-0199")
                    .department("Cardiology Dept")
                    .bio("Experienced cardiologist specializing in cardiovascular health.")
                    .build();
            doctor1 = doctorRepository.save(doctor1);
        } else {
            user1.setPassword(defaultPass);
            userRepository.save(user1);
            doctor1 = doctorRepository.findByUserEmail(doc1Email).orElse(null);
        }

        // Seed Doctor 2
        Doctor doctor2 = null;
        User user2 = userRepository.findByEmail(doc2Email).orElse(null);
        if (user2 == null) {
            User user = User.builder()
                    .name("Dr. Robert Chen")
                    .email(doc2Email)
                    .password(defaultPass)
                    .role(UserRole.ROLE_DOCTOR)
                    .enabled(true)
                    .build();

            doctor2 = Doctor.builder()
                    .user(user)
                    .specialization("Pediatrics")
                    .licenseNumber("LIC-1002346")
                    .phone("+1-555-0200")
                    .department("Pediatrics Dept")
                    .bio("Dedicated pediatrician with over 10 years of clinical experience.")
                    .build();
            doctor2 = doctorRepository.save(doctor2);
        } else {
            user2.setPassword(defaultPass);
            userRepository.save(user2);
            doctor2 = doctorRepository.findByUserEmail(doc2Email).orElse(null);
        }

        // Seed Patient 1 (assigned to Doctor 1)
        User userP1 = userRepository.findByEmail(patient1Email).orElse(null);
        if (userP1 == null) {
            User user = User.builder()
                    .name("John Doe")
                    .email(patient1Email)
                    .password(defaultPass)
                    .role(UserRole.ROLE_PATIENT)
                    .enabled(true)
                    .build();

            Patient patient = Patient.builder()
                    .user(user)
                    .dateOfBirth(LocalDate.of(1988, 5, 12))
                    .gender("Male")
                    .phone("+1-555-0144")
                    .bloodGroup("A+")
                    .address("123 Maple Street, Springfield")
                    .emergencyContact("Mary Doe (+1-555-0145)")
                    .assignedDoctor(doctor1)
                    .build();
            patientRepository.save(patient);
        } else {
            userP1.setPassword(defaultPass);
            userRepository.save(userP1);
        }

        // Seed Patient 2 (assigned to Doctor 2)
        User userP2 = userRepository.findByEmail(patient2Email).orElse(null);
        if (userP2 == null) {
            User user = User.builder()
                    .name("Jane Smith")
                    .email(patient2Email)
                    .password(defaultPass)
                    .role(UserRole.ROLE_PATIENT)
                    .enabled(true)
                    .build();

            Patient patient = Patient.builder()
                    .user(user)
                    .dateOfBirth(LocalDate.of(1992, 9, 23))
                    .gender("Female")
                    .phone("+1-555-0177")
                    .bloodGroup("O-")
                    .address("456 Oak Avenue, Metropolis")
                    .emergencyContact("Richard Smith (+1-555-0178)")
                    .assignedDoctor(doctor2)
                    .build();
            patientRepository.save(patient);
        } else {
            userP2.setPassword(defaultPass);
            userRepository.save(userP2);
        }
    }

    private void seedAuditLogs() {
        if (auditLogRepository.count() < 10) {
            User admin = userRepository.findByEmail("admin@gmail.com").orElse(null);
            User doc1 = userRepository.findByEmail("sarah.jenkins@medvault.com").orElse(null);
            User doc2 = userRepository.findByEmail("robert.chen@medvault.com").orElse(null);
            User patient = userRepository.findByEmail("john.doe@gmail.com").orElse(null);

            LocalDateTime now = LocalDateTime.now();

            auditLogRepository.save(AuditLog.builder().user(patient).action("APPOINTMENT_BOOK").details("Booked an appointment with Dr. Robert Chen").timestamp(now.minusMinutes(5)).ipAddress("127.0.0.1").build());
            auditLogRepository.save(AuditLog.builder().user(doc2).action("RECORD_UPLOAD").details("Uploaded Blood Report for Patient John Doe").timestamp(now.minusMinutes(45)).ipAddress("127.0.0.1").build());
            auditLogRepository.save(AuditLog.builder().user(doc1).action("PRESCRIPTION_CREATE").details("Created prescription for Jane Smith").timestamp(now.minusHours(2)).ipAddress("127.0.0.1").build());
            auditLogRepository.save(AuditLog.builder().user(admin).action("DOCTOR_CREATE").details("Added New Doctor Dr. Robert Chen").timestamp(now.minusHours(4)).ipAddress("127.0.0.1").build());
            auditLogRepository.save(AuditLog.builder().user(patient).action("USER_LOGIN").details("Successful login to patient portal").timestamp(now.minusHours(6)).ipAddress("127.0.0.1").build());
            auditLogRepository.save(AuditLog.builder().user(admin).action("USER_LOGIN").details("Successful login to admin portal").timestamp(now.minusHours(12)).ipAddress("127.0.0.1").build());
            auditLogRepository.save(AuditLog.builder().user(doc2).action("DOCTOR_PROFILE_UPDATE").details("Updated specialization information and contact detail").timestamp(now.minusDays(1).minusHours(2)).ipAddress("127.0.0.1").build());
            auditLogRepository.save(AuditLog.builder().user(patient).action("PATIENT_PROFILE_UPDATE").details("Updated emergency contact detail").timestamp(now.minusDays(1).minusHours(6)).ipAddress("127.0.0.1").build());
            auditLogRepository.save(AuditLog.builder().user(doc1).action("APPOINTMENT_COMPLETE").details("Completed clinical consultation with Jane Smith").timestamp(now.minusDays(2)).ipAddress("127.0.0.1").build());
            auditLogRepository.save(AuditLog.builder().user(patient).action("USER_LOGOUT").details("Successful logout from portal").timestamp(now.minusDays(2).minusHours(3)).ipAddress("127.0.0.1").build());
        }
    }
}
