package com.medvault.controller;

import com.medvault.dto.AppointmentRequest;
import com.medvault.dto.ProfileUpdateRequest;
import com.medvault.entity.Appointment;
import com.medvault.entity.AuditLog;
import com.medvault.entity.Doctor;
import com.medvault.entity.Patient;
import com.medvault.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private ExcelGeneratorService excelGeneratorService;

    @Autowired
    private UserService userService;

    @Autowired
    private MedicalRecordService medicalRecordService;

    // --- Doctor Management ---

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(doctorService.searchDoctors(search));
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @PostMapping("/doctors")
    public ResponseEntity<Doctor> createDoctor(@RequestBody ProfileUpdateRequest request, 
                                               @RequestParam(required = false) String password,
                                               Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(doctorService.createDoctor(request, password, adminEmail, ipAddress));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody ProfileUpdateRequest request,
                                               Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(doctorService.updateDoctor(id, request, adminEmail, ipAddress));
    }

    @PutMapping("/doctors/{id}/disable")
    public ResponseEntity<Map<String, String>> disableDoctor(@PathVariable Long id, Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        doctorService.disableDoctor(id, adminEmail, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Doctor account disabled successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/doctors/{id}/enable")
    public ResponseEntity<Map<String, String>> enableDoctor(@PathVariable Long id, Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        doctorService.enableDoctor(id, adminEmail, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Doctor account enabled successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<Map<String, String>> deleteDoctor(@PathVariable Long id, Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        doctorService.deleteDoctor(id, adminEmail, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Doctor profile deleted successfully");
        return ResponseEntity.ok(response);
    }

    // --- Patient Management ---

    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(patientService.searchPatients(search));
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @PostMapping("/patients")
    public ResponseEntity<Patient> createPatient(@RequestBody ProfileUpdateRequest request,
                                                 @RequestParam(required = false) String password,
                                                 Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(patientService.createPatient(request, password, adminEmail, ipAddress));
    }

    @PutMapping("/patients/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody ProfileUpdateRequest request,
                                                 Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(patientService.updatePatient(id, request, adminEmail, ipAddress));
    }

    @PutMapping("/patients/{patientId}/assign-doctor/{doctorId}")
    public ResponseEntity<Map<String, String>> assignDoctor(@PathVariable Long patientId, @PathVariable Long doctorId,
                                                            Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        patientService.assignDoctor(patientId, doctorId, adminEmail, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Doctor assigned to patient successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/patients/{id}/disable")
    public ResponseEntity<Map<String, String>> disablePatient(@PathVariable Long id, Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        patientService.disablePatient(id, adminEmail, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Patient account disabled successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/patients/{id}/enable")
    public ResponseEntity<Map<String, String>> enablePatient(@PathVariable Long id, Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        patientService.enablePatient(id, adminEmail, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Patient account enabled successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<Map<String, String>> deletePatient(@PathVariable Long id, Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        patientService.deletePatient(id, adminEmail, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Patient profile deleted successfully");
        return ResponseEntity.ok(response);
    }

    // --- Appointment Management ---

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(@PathVariable Long id, @RequestParam String status,
                                                               Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status, adminEmail, ipAddress));
    }

    @PutMapping("/appointments/{id}/reschedule")
    public ResponseEntity<Appointment> rescheduleAppointment(@PathVariable Long id, @RequestParam String newDate,
                                                             Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        LocalDateTime parsedDate = LocalDateTime.parse(newDate);
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, parsedDate, adminEmail, ipAddress));
    }

    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<Map<String, String>> deleteAppointment(@PathVariable Long id, Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        appointmentService.deleteAppointment(id, adminEmail, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Appointment deleted successfully");
        return ResponseEntity.ok(response);
    }

    // --- Audit Logs ---

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    // --- Excel Report Exports ---

    @GetMapping("/reports/excel/users")
    public ResponseEntity<InputStreamResource> exportUserStatsExcel() {
        ByteArrayInputStream bis = excelGeneratorService.generateUserStatsExcel(userService.getAllUsers());
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=user_statistics_report.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/reports/excel/audit-logs")
    public ResponseEntity<InputStreamResource> exportAuditLogsExcel() {
        ByteArrayInputStream bis = excelGeneratorService.generateAuditLogsExcel(auditLogService.getAllLogs());

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=system_audit_logs_report.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/users")
    public ResponseEntity<List<com.medvault.entity.User>> getAllUsersList() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/records")
    public ResponseEntity<List<com.medvault.entity.MedicalRecord>> getAllRecords() {
        return ResponseEntity.ok(medicalRecordService.getAllRecords());
    }

    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<Map<String, String>> toggleUserStatus(@PathVariable Long id, Principal principal, HttpServletRequest servletRequest) {
        String adminEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        userService.toggleUserStatus(id);
        auditLogService.log(adminEmail, "USER_TOGGLE_STATUS", "Toggled status of user ID: " + id, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User status updated successfully");
        return ResponseEntity.ok(response);
    }
}
