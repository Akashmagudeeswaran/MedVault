package com.medvault.controller;

import com.medvault.entity.Doctor;
import com.medvault.entity.Patient;
import com.medvault.service.DashboardService;
import com.medvault.service.DoctorService;
import com.medvault.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PatientService patientService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        return ResponseEntity.ok(dashboardService.getAdminDashboardStats());
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> getDoctorStats(Principal principal) {
        Doctor doctor = doctorService.getDoctorByUserEmail(principal.getName());
        return ResponseEntity.ok(dashboardService.getDoctorDashboardStats(doctor.getId()));
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getPatientStats(Principal principal) {
        Patient patient = patientService.getPatientByUserEmail(principal.getName());
        return ResponseEntity.ok(dashboardService.getPatientDashboardStats(patient.getId()));
    }
}
