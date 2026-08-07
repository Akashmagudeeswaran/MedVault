package com.medvault.controller;

import com.medvault.entity.MedicalRecord;
import com.medvault.service.MedicalRecordService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @Value("${medvault.upload.dir}")
    private String uploadDir;

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getFile(@PathVariable Long id, @RequestParam(value = "download", required = false) boolean download) {
        MedicalRecord record = medicalRecordService.getRecordById(id);
        if (record.getFilePath() == null) {
            throw new com.medvault.exception.ResourceNotFoundException("No file attached to this record.");
        }

        try {
            // filePath looks like "/uploads/uuid.ext". Extract the filename.
            String filename = record.getFilePath().substring(9);
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new com.medvault.exception.ResourceNotFoundException("File not found on disk: " + filename);
            }

            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));

            if (download) {
                headers.setContentDispositionFormData("attachment", record.getFileName() != null ? record.getFileName() : filename);
            } else {
                headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + (record.getFileName() != null ? record.getFileName() : filename) + "\"");
            }

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);

        } catch (MalformedURLException e) {
            throw new RuntimeException("Error loading file: " + e.getMessage());
        } catch (IOException e) {
            throw new RuntimeException("Error probing file type: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable Long id, Principal principal, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        medicalRecordService.deleteMedicalRecord(id, principal.getName(), ipAddress);
        Map<String, String> response = new HashMap<>();
        response.put("message", "File and associated record deleted successfully");
        return ResponseEntity.ok(response);
    }
}
