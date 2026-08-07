package com.medvault.controller;

import com.medvault.entity.Appointment;
import com.medvault.entity.Doctor;
import com.medvault.entity.Patient;
import com.medvault.service.AppointmentService;
import com.medvault.service.DoctorService;
import com.medvault.service.PatientService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAssignedPatients(Principal principal) {
        Doctor doctor = doctorService.getDoctorByUserEmail(principal.getName());
        return ResponseEntity.ok(patientService.getPatientsByDoctor(doctor.getId()));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(Principal principal) {
        Doctor doctor = doctorService.getDoctorByUserEmail(principal.getName());
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctor.getId()));
    }

    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(@PathVariable Long id, @RequestParam String status,
                                                               Principal principal, HttpServletRequest servletRequest) {
        String doctorEmail = principal.getName();
        String ipAddress = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status, doctorEmail, ipAddress));
    }
}
