package com.medvault.service;

import com.medvault.dto.AppointmentRequest;
import com.medvault.entity.Appointment;
import com.medvault.entity.Doctor;
import com.medvault.entity.Patient;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.AppointmentRepository;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationService notificationService;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found for ID: " + id));
    }

    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
    }

    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctorId);
    }

    @Transactional
    public Appointment bookAppointment(AppointmentRequest request, String actorEmail, String ipAddress) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for ID: " + request.getPatientId()));
        
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for ID: " + request.getDoctorId()));

        // Validations
        if (request.getAppointmentDate() == null) {
            throw new com.medvault.exception.BadRequestException("Appointment date is required.");
        }
        
        if (request.getAppointmentDate().isBefore(LocalDateTime.now())) {
            throw new com.medvault.exception.BadRequestException("Appointment date cannot be in the past.");
        }

        if (doctor.getUser() != null && !doctor.getUser().isEnabled()) {
            throw new com.medvault.exception.BadRequestException("Doctor is disabled.");
        }

        boolean alreadyBooked = appointmentRepository.existsByDoctorIdAndAppointmentDateAndStatusNotIn(
                doctor.getId(),
                request.getAppointmentDate(),
                List.of("CANCELLED", "REJECTED")
        );
        if (alreadyBooked) {
            throw new com.medvault.exception.BadRequestException("Doctor already booked. Choose another slot.");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .symptoms(request.getSymptoms())
                .reason(request.getReason())
                .status("PENDING")
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Audit Log
        auditLogService.log(actorEmail, "APPOINTMENT_BOOK", 
                "Booked appointment ID: " + savedAppointment.getId() + " with Doctor " + doctor.getUser().getName(), ipAddress);

        // Send Notifications
        notificationService.createNotification(doctor.getUser(), "New Appointment Booked", 
                "Patient " + patient.getUser().getName() + " has requested an appointment on " + request.getAppointmentDate(), "APPOINTMENT");
        notificationService.createNotification(patient.getUser(), "Appointment Request Placed", 
                "Your appointment request with Dr. " + doctor.getUser().getName() + " is pending approval.", "APPOINTMENT");

        return savedAppointment;
    }

    @Transactional
    public Appointment updateAppointmentStatus(Long id, String status, String actorEmail, String ipAddress) {
        Appointment appointment = getAppointmentById(id);
        String oldStatus = appointment.getStatus();
        appointment.setStatus(status.toUpperCase());
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Audit Log
        auditLogService.log(actorEmail, "APPOINTMENT_STATUS_CHANGE", 
                "Updated appointment ID: " + id + " from " + oldStatus + " to " + status, ipAddress);

        // Notify patient & doctor
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        if (status.equalsIgnoreCase("APPROVED")) {
            notificationService.createNotification(patient.getUser(), "Appointment Approved", 
                    "Your appointment with Dr. " + doctor.getUser().getName() + " on " + appointment.getAppointmentDate() + " has been approved.", "APPOINTMENT");
        } else if (status.equalsIgnoreCase("REJECTED")) {
            notificationService.createNotification(patient.getUser(), "Appointment Rejected", 
                    "Your appointment request with Dr. " + doctor.getUser().getName() + " on " + appointment.getAppointmentDate() + " was rejected.", "APPOINTMENT");
        } else if (status.equalsIgnoreCase("CANCELLED")) {
            notificationService.createNotification(doctor.getUser(), "Appointment Cancelled", 
                    "Appointment with patient " + patient.getUser().getName() + " on " + appointment.getAppointmentDate() + " has been cancelled.", "APPOINTMENT");
            notificationService.createNotification(patient.getUser(), "Appointment Cancelled", 
                    "You successfully cancelled your appointment with Dr. " + doctor.getUser().getName() + ".", "APPOINTMENT");
        } else if (status.equalsIgnoreCase("COMPLETED")) {
            notificationService.createNotification(patient.getUser(), "Appointment Completed", 
                    "Your clinical consultation with Dr. " + doctor.getUser().getName() + " is completed. Check your dashboard for records.", "APPOINTMENT");
        }

        return updatedAppointment;
    }

    @Transactional
    public Appointment rescheduleAppointment(Long id, LocalDateTime newDate, String actorEmail, String ipAddress) {
        Appointment appointment = getAppointmentById(id);
        LocalDateTime oldDate = appointment.getAppointmentDate();
        appointment.setAppointmentDate(newDate);
        appointment.setStatus("PENDING"); // Reset status to PENDING upon reschedule
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Audit
        auditLogService.log(actorEmail, "APPOINTMENT_RESCHEDULE", 
                "Rescheduled appointment ID: " + id + " from " + oldDate + " to " + newDate, ipAddress);

        // Notify
        notificationService.createNotification(appointment.getDoctor().getUser(), "Appointment Rescheduled", 
                "Patient " + appointment.getPatient().getUser().getName() + " has rescheduled the appointment to " + newDate + ". Action required.", "APPOINTMENT");
        notificationService.createNotification(appointment.getPatient().getUser(), "Appointment Rescheduled", 
                "Your appointment has been rescheduled to " + newDate + " and is pending doctor approval.", "APPOINTMENT");

        return updatedAppointment;
    }

    @Transactional
    public void deleteAppointment(Long id, String adminEmail, String ipAddress) {
        Appointment appointment = getAppointmentById(id);
        appointmentRepository.delete(appointment);

        // Audit
        auditLogService.log(adminEmail, "APPOINTMENT_DELETE", "Deleted appointment ID: " + id, ipAddress);
    }
}
