package com.medvault.service;

import com.medvault.dto.ProfileUpdateRequest;
import com.medvault.entity.Doctor;
import com.medvault.entity.User;
import com.medvault.entity.UserRole;
import com.medvault.exception.BadRequestException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorByUserEmail(String email) {
        return doctorRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for email: " + email));
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for ID: " + id));
    }

    public Doctor getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for User ID: " + userId));
    }

    public List<Doctor> searchDoctors(String query) {
        if (query == null || query.trim().isEmpty()) {
            return doctorRepository.findAll();
        }
        return doctorRepository.searchDoctors(query);
    }

    @Transactional
    public Doctor createDoctor(ProfileUpdateRequest request, String password, String adminEmail, String ipAddress) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address already in use.");
        }

        // Create User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(password != null ? password : "Doctor@123")) // Default password if empty
                .role(UserRole.ROLE_DOCTOR)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        // Create Doctor Profile
        Doctor doctor = Doctor.builder()
                .user(savedUser)
                .specialization(request.getSpecialization())
                .licenseNumber(request.getLicenseNumber())
                .phone(request.getPhone())
                .department(request.getDepartment())
                .bio(request.getBio())
                .build();

        Doctor savedDoctor = doctorRepository.save(doctor);

        // Audit Log
        auditLogService.log(adminEmail, "DOCTOR_CREATE", 
                "Created doctor profile: " + savedUser.getEmail() + " (ID: " + savedDoctor.getId() + ")", ipAddress);

        return savedDoctor;
    }

    @Transactional
    public Doctor updateDoctor(Long id, ProfileUpdateRequest request, String actorEmail, String ipAddress) {
        Doctor doctor = getDoctorById(id);
        User user = doctor.getUser();

        // Update User info
        if (request.getName() != null) user.setName(request.getName());
        // Do not allow email change easily or check uniqueness if changed
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use.");
            }
            user.setEmail(request.getEmail());
        }
        userRepository.save(user);

        // Update Doctor info
        if (request.getSpecialization() != null) doctor.setSpecialization(request.getSpecialization());
        if (request.getLicenseNumber() != null) doctor.setLicenseNumber(request.getLicenseNumber());
        if (request.getPhone() != null) doctor.setPhone(request.getPhone());
        if (request.getDepartment() != null) doctor.setDepartment(request.getDepartment());
        if (request.getBio() != null) doctor.setBio(request.getBio());

        Doctor updatedDoctor = doctorRepository.save(doctor);

        // Audit Log
        auditLogService.log(actorEmail, "DOCTOR_UPDATE", 
                "Updated doctor profile: " + user.getEmail() + " (ID: " + id + ")", ipAddress);

        return updatedDoctor;
    }

    @Transactional
    public void disableDoctor(Long id, String adminEmail, String ipAddress) {
        Doctor doctor = getDoctorById(id);
        User user = doctor.getUser();
        user.setEnabled(false);
        userRepository.save(user);

        // Audit Log
        auditLogService.log(adminEmail, "DOCTOR_DISABLE", 
                "Disabled doctor account: " + user.getEmail(), ipAddress);
    }

    @Transactional
    public void enableDoctor(Long id, String adminEmail, String ipAddress) {
        Doctor doctor = getDoctorById(id);
        User user = doctor.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        // Audit Log
        auditLogService.log(adminEmail, "DOCTOR_ENABLE", 
                "Enabled doctor account: " + user.getEmail(), ipAddress);
    }

    @Transactional
    public void deleteDoctor(Long id, String adminEmail, String ipAddress) {
        Doctor doctor = getDoctorById(id);
        String doctorEmail = doctor.getUser().getEmail();
        doctorRepository.delete(doctor);

        // Audit Log
        auditLogService.log(adminEmail, "DOCTOR_DELETE", 
                "Deleted doctor profile & user: " + doctorEmail, ipAddress);
    }
}
