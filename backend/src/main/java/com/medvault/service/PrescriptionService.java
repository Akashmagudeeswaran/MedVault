package com.medvault.service;

import com.medvault.dto.MedicineRequest;
import com.medvault.dto.PrescriptionRequest;
import com.medvault.entity.*;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationService notificationService;

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    public Prescription getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found for ID: " + id));
    }

    public List<Prescription> getPrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findByPatientIdOrderByDatePrescribedDesc(patientId);
    }

    public List<Prescription> getPrescriptionsByDoctor(Long doctorId) {
        return prescriptionRepository.findByDoctorIdOrderByDatePrescribedDesc(doctorId);
    }

    public Optional<Prescription> getPrescriptionByAppointment(Long appointmentId) {
        return prescriptionRepository.findByAppointmentId(appointmentId);
    }

    @Transactional
    public Prescription createPrescription(PrescriptionRequest request, String actorEmail, String ipAddress) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + request.getPatientId()));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + request.getDoctorId()));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId()).orElse(null);
        }

        // Build prescription
        Prescription prescription = Prescription.builder()
                .patient(patient)
                .doctor(doctor)
                .appointment(appointment)
                .datePrescribed(request.getDatePrescribed())
                .notes(request.getNotes())
                .build();

        // Map medicines list
        List<Medicine> medicines = new ArrayList<>();
        if (request.getMedicines() != null) {
            for (MedicineRequest medReq : request.getMedicines()) {
                Medicine medicine = Medicine.builder()
                        .prescription(prescription)
                        .name(medReq.getName())
                        .dosage(medReq.getDosage())
                        .frequency(medReq.getFrequency())
                        .duration(medReq.getDuration())
                        .instructions(medReq.getInstructions())
                        .build();
                medicines.add(medicine);
            }
        }
        prescription.setMedicines(medicines);

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Auto mark appointment status as COMPLETED if prescription is saved
        if (appointment != null) {
            appointment.setStatus("COMPLETED");
            appointmentRepository.save(appointment);
        }

        // Audit Log
        auditLogService.log(actorEmail, "PRESCRIPTION_CREATE", 
                "Created prescription ID: " + savedPrescription.getId() + " for Patient " + patient.getUser().getName(), ipAddress);

        // Notify patient
        notificationService.createNotification(patient.getUser(), "New Prescription Issued", 
                "Dr. " + doctor.getUser().getName() + " issued a new prescription for you on " + request.getDatePrescribed(), "PRESCRIPTION");

        return savedPrescription;
    }

    @Transactional
    public Prescription updatePrescription(Long id, PrescriptionRequest request, String actorEmail, String ipAddress) {
        Prescription prescription = getPrescriptionById(id);

        if (request.getNotes() != null) prescription.setNotes(request.getNotes());
        if (request.getDatePrescribed() != null) prescription.setDatePrescribed(request.getDatePrescribed());

        // Update Medicines: clear existing and re-add new to prevent complex merging issues
        prescription.getMedicines().clear();
        if (request.getMedicines() != null) {
            for (MedicineRequest medReq : request.getMedicines()) {
                Medicine medicine = Medicine.builder()
                        .prescription(prescription)
                        .name(medReq.getName())
                        .dosage(medReq.getDosage())
                        .frequency(medReq.getFrequency())
                        .duration(medReq.getDuration())
                        .instructions(medReq.getInstructions())
                        .build();
                prescription.getMedicines().add(medicine);
            }
        }

        Prescription updatedPrescription = prescriptionRepository.save(prescription);

        // Audit Log
        auditLogService.log(actorEmail, "PRESCRIPTION_UPDATE", "Updated prescription ID: " + id, ipAddress);

        return updatedPrescription;
    }

    @Transactional
    public void deletePrescription(Long id, String actorEmail, String ipAddress) {
        Prescription prescription = getPrescriptionById(id);
        prescriptionRepository.delete(prescription);

        // Audit Log
        auditLogService.log(actorEmail, "PRESCRIPTION_DELETE", "Deleted prescription ID: " + id, ipAddress);
    }
}
