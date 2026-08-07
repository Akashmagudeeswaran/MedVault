package com.medvault.service;

import com.medvault.dto.MedicalRecordRequest;
import com.medvault.entity.Doctor;
import com.medvault.entity.LabReport;
import com.medvault.entity.MedicalRecord;
import com.medvault.entity.Patient;
import com.medvault.exception.BadRequestException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.LabReportRepository;
import com.medvault.repository.MedicalRecordRepository;
import com.medvault.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private LabReportRepository labReportRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationService notificationService;

    @Value("${medvault.upload.dir}")
    private String uploadDir;

    public List<MedicalRecord> getAllRecords() {
        return medicalRecordRepository.findAll();
    }

    public MedicalRecord getRecordById(Long id) {
        return medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found for ID: " + id));
    }

    public List<MedicalRecord> getRecordsByPatient(Long patientId) {
        return medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId);
    }

    public List<MedicalRecord> searchPatientRecords(Long patientId, String query) {
        return medicalRecordRepository.searchPatientRecords(patientId, query);
    }

    @Transactional
    public MedicalRecord createMedicalRecord(MedicalRecordRequest request, String actorEmail, String ipAddress) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + request.getPatientId()));
        
        Doctor doctor = null;
        if (request.getDoctorId() != null) {
            doctor = doctorRepository.findById(request.getDoctorId()).orElse(null);
        }

        MedicalRecord record = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .recordDate(request.getRecordDate())
                .build();

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        // Audit Log
        auditLogService.log(actorEmail, "MEDICAL_RECORD_CREATE", 
                "Created medical record ID: " + savedRecord.getId() + " Category: " + savedRecord.getCategory(), ipAddress);

        // Notify patient if uploaded by doctor/admin
        if (doctor != null) {
            notificationService.createNotification(patient.getUser(), "New Medical Record Added", 
                    "Dr. " + doctor.getUser().getName() + " uploaded a new medical record: " + request.getTitle(), "MEDICAL_RECORD");
        }

        return savedRecord;
    }

    @Transactional
    public LabReport uploadReportFile(Long recordId, String testName, MultipartFile file, String actorEmail, String ipAddress) {
        MedicalRecord record = getRecordById(recordId);

        if (file.isEmpty()) {
            throw new BadRequestException("Cannot upload empty file.");
        }

        try {
            // Guarantee upload directory existence
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Create unique file name
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            // Validate extension
            String ext = fileExtension.toLowerCase();
            if (!ext.equals(".pdf") && !ext.equals(".jpg") && !ext.equals(".png") && !ext.equals(".jpeg")) {
                throw new BadRequestException("Unsupported file type! Only PDF, JPG, PNG, JPEG are allowed.");
            }

            String savedFileName = UUID.randomUUID().toString() + ext;
            Path filePath = uploadPath.resolve(savedFileName);
            Files.copy(file.getInputStream(), filePath);

            // Store details in LabReport
            LabReport report = LabReport.builder()
                    .medicalRecord(record)
                    .testName(testName != null ? testName : record.getTitle())
                    .testDate(record.getRecordDate())
                    .results("File Upload: " + originalFileName)
                    .status("COMPLETED")
                    .filePath("/uploads/" + savedFileName) // Serve path matching WebConfig mapping
                    .build();

            LabReport savedReport = labReportRepository.save(report);

            // Audit
            auditLogService.log(actorEmail, "LAB_REPORT_UPLOAD", 
                    "Uploaded file " + originalFileName + " for Medical Record ID: " + recordId, ipAddress);

            return savedReport;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file locally: " + e.getMessage());
        }
    }

    @Transactional
    public MedicalRecord uploadRecordDirectly(MultipartFile file, String actorEmail, String ipAddress) {
        Patient patient = patientRepository.findByUserEmail(actorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for email: " + actorEmail));

        if (file.isEmpty()) {
            throw new BadRequestException("Cannot upload empty file.");
        }
        
        if (file.getSize() > 20 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 20 MB limit!");
        }

        try {
            // Guarantee upload directory existence
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Create unique file name
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            // Validate extension
            String ext = fileExtension.toLowerCase();
            if (!ext.equals(".pdf") && !ext.equals(".jpg") && !ext.equals(".png") && !ext.equals(".jpeg")) {
                throw new BadRequestException("Unsupported file type! Only PDF, JPG, PNG, JPEG are allowed.");
            }

            String savedFileName = UUID.randomUUID().toString() + ext;
            Path filePath = uploadPath.resolve(savedFileName);
            Files.copy(file.getInputStream(), filePath);

            // Determine Title
            String title = originalFileName;
            if (title != null && title.contains(".")) {
                title = title.substring(0, title.lastIndexOf("."));
            }
            if (title != null) {
                title = title.replace("-", " ").replace("_", " ");
            } else {
                title = "Uploaded Report";
            }

            // Determine Category
            String category = "Other";
            String titleLower = title.toLowerCase();
            if (titleLower.contains("blood")) {
                category = "Blood Report";
            } else if (titleLower.contains("xray") || titleLower.contains("x-ray")) {
                category = "X-Ray";
            } else if (titleLower.contains("prescription")) {
                category = "Prescription";
            } else if (titleLower.contains("scan")) {
                category = "Scan";
            }

            // Store in database
            MedicalRecord record = MedicalRecord.builder()
                    .patient(patient)
                    .title(title)
                    .description("Patient self-uploaded report: " + originalFileName)
                    .category(category)
                    .recordDate(LocalDate.now())
                    .fileName(originalFileName)
                    .filePath("/uploads/" + savedFileName)
                    .fileSize(file.getSize())
                    .uploadedAt(LocalDateTime.now())
                    .build();

            MedicalRecord savedRecord = medicalRecordRepository.save(record);

            // Audit
            auditLogService.log(actorEmail, "PATIENT_RECORD_UPLOAD", 
                    "Uploaded file " + originalFileName + " (Record ID: " + savedRecord.getId() + ")", ipAddress);

            return savedRecord;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file locally: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteMedicalRecord(Long id, String actorEmail, String ipAddress) {
        MedicalRecord record = getRecordById(id);
        
        // Find attached lab reports and delete files locally
        List<LabReport> reports = labReportRepository.findByMedicalRecordId(id);
        for (LabReport report : reports) {
            if (report.getFilePath() != null && report.getFilePath().startsWith("/uploads/")) {
                String fileName = report.getFilePath().substring(9);
                Path path = Paths.get(uploadDir).resolve(fileName);
                try {
                    Files.deleteIfExists(path);
                } catch (IOException e) {
                    // Fail-silent for file deletion
                }
            }
        }

        // Delete self-uploaded file
        if (record.getFilePath() != null && record.getFilePath().startsWith("/uploads/")) {
            String fileName = record.getFilePath().substring(9);
            Path path = Paths.get(uploadDir).resolve(fileName);
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                // Fail-silent for file deletion
            }
        }

        medicalRecordRepository.delete(record);

        // Audit Log
        auditLogService.log(actorEmail, "MEDICAL_RECORD_DELETE", "Deleted medical record ID: " + id, ipAddress);
    }
}
