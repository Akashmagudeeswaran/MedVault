package com.medvault.service;

import com.medvault.dto.ProfileUpdateRequest;
import com.medvault.entity.Doctor;
import com.medvault.entity.Patient;
import com.medvault.entity.User;
import com.medvault.entity.UserRole;
import com.medvault.exception.BadRequestException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientByUserEmail(String email) {
        return patientRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for email: " + email));
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for ID: " + id));
    }

    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for User ID: " + userId));
    }

    public List<Patient> getPatientsByDoctor(Long doctorId) {
        return patientRepository.findByAssignedDoctorId(doctorId);
    }

    public List<Patient> searchPatients(String query) {
        if (query == null || query.trim().isEmpty()) {
            return patientRepository.findAll();
        }
        return patientRepository.searchPatients(query);
    }

    @Transactional
    public Patient createPatient(ProfileUpdateRequest request, String password, String adminEmail, String ipAddress) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address already in use.");
        }

        // Create User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(password != null ? password : "Patient@123"))
                .role(UserRole.ROLE_PATIENT)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        // Create Patient Profile
        Patient patient = Patient.builder()
                .user(savedUser)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .phone(request.getPhone())
                .bloodGroup(request.getBloodGroup())
                .address(request.getAddress())
                .emergencyContact(request.getEmergencyContact())
                .build();

        Patient savedPatient = patientRepository.save(patient);

        // Audit Log
        auditLogService.log(adminEmail, "PATIENT_CREATE", 
                "Created patient profile: " + savedUser.getEmail() + " (ID: " + savedPatient.getId() + ")", ipAddress);

        return savedPatient;
    }

    @Transactional
    public Patient updatePatient(Long id, ProfileUpdateRequest request, String actorEmail, String ipAddress) {
        Patient patient = getPatientById(id);
        User user = patient.getUser();

        // Update User info
        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use.");
            }
            user.setEmail(request.getEmail());
        }
        userRepository.save(user);

        // Update Patient profile info
        if (request.getDateOfBirth() != null) patient.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) patient.setGender(request.getGender());
        if (request.getPhone() != null) patient.setPhone(request.getPhone());
        if (request.getBloodGroup() != null) patient.setBloodGroup(request.getBloodGroup());
        if (request.getAddress() != null) patient.setAddress(request.getAddress());
        if (request.getEmergencyContact() != null) patient.setEmergencyContact(request.getEmergencyContact());

        Patient updatedPatient = patientRepository.save(patient);

        // Audit Log
        auditLogService.log(actorEmail, "PATIENT_UPDATE", 
                "Updated patient profile: " + user.getEmail() + " (ID: " + id + ")", ipAddress);

        return updatedPatient;
    }

    @Transactional
    public void assignDoctor(Long patientId, Long doctorId, String adminEmail, String ipAddress) {
        Patient patient = getPatientById(patientId);
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));

        patient.setAssignedDoctor(doctor);
        patientRepository.save(patient);

        // Audit Log
        auditLogService.log(adminEmail, "PATIENT_ASSIGN_DOCTOR", 
                "Assigned Doctor " + doctor.getUser().getName() + " to Patient " + patient.getUser().getName(), ipAddress);
    }

    @Transactional
    public void disablePatient(Long id, String adminEmail, String ipAddress) {
        Patient patient = getPatientById(id);
        User user = patient.getUser();
        user.setEnabled(false);
        userRepository.save(user);

        // Audit Log
        auditLogService.log(adminEmail, "PATIENT_DISABLE", 
                "Disabled patient account: " + user.getEmail(), ipAddress);
    }

    @Transactional
    public void enablePatient(Long id, String adminEmail, String ipAddress) {
        Patient patient = getPatientById(id);
        User user = patient.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        // Audit Log
        auditLogService.log(adminEmail, "PATIENT_ENABLE", 
                "Enabled patient account: " + user.getEmail(), ipAddress);
    }

    @Transactional
    public void deletePatient(Long id, String adminEmail, String ipAddress) {
        Patient patient = getPatientById(id);
        String patientEmail = patient.getUser().getEmail();
        patientRepository.delete(patient);

        // Audit Log
        auditLogService.log(adminEmail, "PATIENT_DELETE", 
                "Deleted patient profile & user: " + patientEmail, ipAddress);
    }
}
