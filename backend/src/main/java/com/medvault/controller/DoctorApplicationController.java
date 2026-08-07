package com.medvault.controller;

import com.medvault.entity.DoctorApplication;
import com.medvault.service.AuditLogService;
import com.medvault.service.DoctorApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DoctorApplicationController {

    @Autowired
    private DoctorApplicationService doctorApplicationService;

    @Autowired
    private AuditLogService auditLogService;

    // Public Sign-up Endpoint
    @PostMapping("/auth/doctor/signup")
    public ResponseEntity<DoctorApplication> submitApplication(
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("hospital") String hospital,
            @RequestParam("specialization") String specialization,
            @RequestParam(value = "mbbsCertificate", required = false) MultipartFile mbbsCertificate,
            @RequestParam(value = "experienceCertificate", required = false) MultipartFile experienceCertificate,
            HttpServletRequest request) throws IOException {

        DoctorApplication application = doctorApplicationService.submitApplication(
                name, email, password, hospital, specialization, mbbsCertificate, experienceCertificate
        );

        auditLogService.log(null, "DOCTOR_SIGNUP_SUBMIT", "Submitted doctor application from: " + email, request.getRemoteAddr());
        return ResponseEntity.ok(application);
    }

    // Admin List Applications
    @GetMapping("/admin/doctor-applications")
    public ResponseEntity<List<DoctorApplication>> getApplications(@RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(doctorApplicationService.getApplications(status));
    }

    // Admin Approve Application
    @PutMapping("/admin/doctor-applications/{id}/approve")
    public ResponseEntity<Map<String, String>> approveApplication(
            @PathVariable Long id, 
            Principal principal, 
            HttpServletRequest request) {

        doctorApplicationService.approveApplication(id);
        auditLogService.log(principal.getName(), "DOCTOR_APPLICATION_APPROVE", "Approved doctor application ID: " + id, request.getRemoteAddr());
        
        return ResponseEntity.ok(Map.of("message", "Application approved successfully."));
    }

    // Admin Reject Application
    @PutMapping("/admin/doctor-applications/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectApplication(
            @PathVariable Long id, 
            Principal principal, 
            HttpServletRequest request) {

        doctorApplicationService.rejectApplication(id);
        auditLogService.log(principal.getName(), "DOCTOR_APPLICATION_REJECT", "Rejected doctor application ID: " + id, request.getRemoteAddr());
        
        return ResponseEntity.ok(Map.of("message", "Application rejected successfully."));
    }

    // Admin Statistics Dashboard
    @GetMapping("/admin/doctor-applications/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(doctorApplicationService.getApplicationStats());
    }
}
