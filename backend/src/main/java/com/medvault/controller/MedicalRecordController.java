package com.medvault.controller;

import com.medvault.dto.MedicalRecordRequest;
import com.medvault.entity.MedicalRecord;
import com.medvault.service.MedicalRecordService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
@PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecord>> getPatientRecords(@PathVariable Long patientId) {
        return ResponseEntity.ok(medicalRecordService.getRecordsByPatient(patientId));
    }

    @PostMapping
    public ResponseEntity<MedicalRecord> createRecord(@Valid @RequestBody MedicalRecordRequest recordRequest,
                                                      Principal principal, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(medicalRecordService.createMedicalRecord(recordRequest, principal.getName(), ipAddress));
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@PathVariable Long id,
                                                          @RequestParam("file") MultipartFile file,
                                                          @RequestParam(value = "testName", required = false) String testName,
                                                          Principal principal, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        medicalRecordService.uploadReportFile(id, testName, file, principal.getName(), ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "File uploaded successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRecord(@PathVariable Long id, Principal principal, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        medicalRecordService.deleteMedicalRecord(id, principal.getName(), ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Medical record deleted successfully");
        return ResponseEntity.ok(response);
    }
}
