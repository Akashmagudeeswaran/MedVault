package com.medvault.controller;

import com.medvault.dto.PrescriptionRequest;
import com.medvault.entity.Prescription;
import com.medvault.service.PdfGeneratorService;
import com.medvault.service.PrescriptionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private PdfGeneratorService pdfGeneratorService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getPatientPrescriptions(@PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getPrescriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<Prescription> getPrescriptionByAppointment(@PathVariable Long appointmentId) {
        return prescriptionService.getPrescriptionByAppointment(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Prescription> createPrescription(@Valid @RequestBody PrescriptionRequest prescriptionRequest,
                                                           Principal principal, HttpServletRequest request) {
        String doctorEmail = principal.getName();
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(prescriptionService.createPrescription(prescriptionRequest, doctorEmail, ipAddress));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Prescription> updatePrescription(@PathVariable Long id,
                                                           @Valid @RequestBody PrescriptionRequest prescriptionRequest,
                                                           Principal principal, HttpServletRequest request) {
        String doctorEmail = principal.getName();
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(prescriptionService.updatePrescription(id, prescriptionRequest, doctorEmail, ipAddress));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, String>> deletePrescription(@PathVariable Long id, Principal principal, HttpServletRequest request) {
        String doctorEmail = principal.getName();
        String ipAddress = request.getRemoteAddr();
        prescriptionService.deletePrescription(id, doctorEmail, ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Prescription deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<InputStreamResource> downloadPrescriptionPdf(@PathVariable Long id) {
        Prescription prescription = prescriptionService.getPrescriptionById(id);
        ByteArrayInputStream bis = pdfGeneratorService.generatePrescriptionPdf(prescription);

        HttpHeaders headers = new HttpHeaders();
        // Serve as inline PDF so it renders directly in the browser or can be downloaded easily
        headers.add("Content-Disposition", "inline; filename=prescription_" + id + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
