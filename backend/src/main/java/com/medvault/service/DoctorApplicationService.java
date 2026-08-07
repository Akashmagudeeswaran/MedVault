package com.medvault.service;

import com.medvault.entity.Doctor;
import com.medvault.entity.DoctorApplication;
import com.medvault.entity.User;
import com.medvault.entity.UserRole;
import com.medvault.exception.BadRequestException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.DoctorApplicationRepository;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DoctorApplicationService {

    @Autowired
    private DoctorApplicationRepository doctorApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional
    public DoctorApplication submitApplication(String name, String email, String password, 
                                               String hospital, String specialization, 
                                               MultipartFile mbbsFile, MultipartFile expFile) throws IOException {
        
        // 1. Verify email is not registered
        if (userRepository.existsByEmail(email) || doctorApplicationRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("Email address is already in use by an active account or pending application.");
        }

        // 3. Save files if present
        Path certificatesDir = Paths.get(uploadDir, "certificates");
        
        String mbbsFileName = null;
        if (mbbsFile != null && !mbbsFile.isEmpty()) {
            Files.createDirectories(certificatesDir);
            mbbsFileName = UUID.randomUUID().toString() + "_" + mbbsFile.getOriginalFilename();
            Path mbbsPath = certificatesDir.resolve(mbbsFileName);
            Files.copy(mbbsFile.getInputStream(), mbbsPath, StandardCopyOption.REPLACE_EXISTING);
        }

        String expFileName = null;
        if (expFile != null && !expFile.isEmpty()) {
            Files.createDirectories(certificatesDir);
            expFileName = UUID.randomUUID().toString() + "_" + expFile.getOriginalFilename();
            Path expPath = certificatesDir.resolve(expFileName);
            Files.copy(expFile.getInputStream(), expPath, StandardCopyOption.REPLACE_EXISTING);
        }

        // 4. Create and save application
        DoctorApplication app = DoctorApplication.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .hospital(hospital)
                .specialization(specialization)
                .mbbsCertificatePath(mbbsFileName != null ? "certificates/" + mbbsFileName : null)
                .experienceCertificatePath(expFileName != null ? "certificates/" + expFileName : null)
                .status("PENDING")
                .build();

        return doctorApplicationRepository.save(app);
    }

    public List<DoctorApplication> getApplications(String status) {
        if (status == null || status.equalsIgnoreCase("All")) {
            return doctorApplicationRepository.findAll();
        }
        return doctorApplicationRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
    }

    @Transactional
    public void approveApplication(Long id) {
        DoctorApplication app = doctorApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor application not found."));

        if (!app.getStatus().equals("PENDING")) {
            throw new BadRequestException("Application is already processed with status: " + app.getStatus());
        }

        // 1. Create User
        User user = User.builder()
                .name(app.getName())
                .email(app.getEmail())
                .password(app.getPassword()) // password already encoded during signup
                .role(UserRole.ROLE_DOCTOR)
                .enabled(true)
                .build();
        userRepository.save(user);

        // 2. Create Doctor Profile
        Doctor doctor = Doctor.builder()
                .user(user)
                .specialization(app.getSpecialization())
                .licenseNumber("LIC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .department(app.getHospital())
                .build();
        doctorRepository.save(doctor);

        // 3. Update application status
        app.setStatus("APPROVED");
        doctorApplicationRepository.save(app);
    }

    @Transactional
    public void rejectApplication(Long id) {
        DoctorApplication app = doctorApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor application not found."));

        if (!app.getStatus().equals("PENDING")) {
            throw new BadRequestException("Application is already processed with status: " + app.getStatus());
        }

        app.setStatus("REJECTED");
        doctorApplicationRepository.save(app);
    }

    public Map<String, Object> getApplicationStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalApplications", doctorApplicationRepository.count());
        stats.put("pending", doctorApplicationRepository.countByStatus("PENDING"));
        stats.put("approved", doctorApplicationRepository.countByStatus("APPROVED"));
        stats.put("rejected", doctorApplicationRepository.countByStatus("REJECTED"));
        return stats;
    }
}
