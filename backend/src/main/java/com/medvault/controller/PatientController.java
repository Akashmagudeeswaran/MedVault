package com.medvault.controller;

import com.medvault.dto.AppointmentRequest;
import com.medvault.dto.MedicalRecordRequest;
import com.medvault.dto.ProfileUpdateRequest;
import com.medvault.entity.Appointment;
import com.medvault.entity.Doctor;
import com.medvault.entity.MedicalRecord;
import com.medvault.entity.Patient;
import com.medvault.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private MedicalRecordService medicalRecordService;

    @GetMapping("/profile")
    public ResponseEntity<Patient> getProfile(Principal principal) {
        return ResponseEntity.ok(patientService.getPatientByUserEmail(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<Patient> updateProfile(@RequestBody ProfileUpdateRequest updateRequest, 
                                                 Principal principal, HttpServletRequest request) {
        Patient patient = patientService.getPatientByUserEmail(principal.getName());
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(patientService.updatePatient(patient.getId(), updateRequest, principal.getName(), ipAddress));
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getDoctorsList() {
        // Patients need a list of doctors to choose from when booking appointments
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAppointments(Principal principal) {
        Patient patient = patientService.getPatientByUserEmail(principal.getName());
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patient.getId()));
    }

    @PostMapping("/appointments")
    public ResponseEntity<Appointment> bookAppointment(@Valid @RequestBody AppointmentRequest appointmentRequest,
                                                       Principal principal, HttpServletRequest request) {
        Patient patient = patientService.getPatientByUserEmail(principal.getName());
        appointmentRequest.setPatientId(patient.getId()); // Force mapping to the logged-in patient
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(appointmentService.bookAppointment(appointmentRequest, principal.getName(), ipAddress));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable Long id, Principal principal, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, "CANCELLED", principal.getName(), ipAddress));
    }

    @GetMapping("/records")
    public ResponseEntity<List<MedicalRecord>> getMedicalRecords(Principal principal) {
        Patient patient = patientService.getPatientByUserEmail(principal.getName());
        return ResponseEntity.ok(medicalRecordService.getRecordsByPatient(patient.getId()));
    }

    @PostMapping("/records")
    public ResponseEntity<MedicalRecord> uploadRecordMetadata(@Valid @RequestBody MedicalRecordRequest recordRequest,
                                                              Principal principal, HttpServletRequest request) {
        Patient patient = patientService.getPatientByUserEmail(principal.getName());
        recordRequest.setPatientId(patient.getId()); // Force mapping to patient
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(medicalRecordService.createMedicalRecord(recordRequest, principal.getName(), ipAddress));
    }

    @PostMapping("/records/{id}/upload")
    public ResponseEntity<Map<String, String>> uploadRecordFile(@PathVariable Long id,
                                                                @RequestParam("file") MultipartFile file,
                                                                @RequestParam(value = "testName", required = false) String testName,
                                                                Principal principal, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        medicalRecordService.uploadReportFile(id, testName, file, principal.getName(), ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "File uploaded successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/records/upload")
    public ResponseEntity<Map<String, Object>> uploadRecordDirect(
            @RequestParam("file") MultipartFile file,
            Principal principal,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        MedicalRecord record = medicalRecordService.uploadRecordDirectly(file, principal.getName(), ipAddress);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", record.getId());
        response.put("title", record.getTitle());
        response.put("fileName", record.getFileName());
        response.put("fileUrl", "/api/files/" + record.getId());
        response.put("uploadedAt", record.getUploadedAt());
        return ResponseEntity.ok(response);
    }
}
