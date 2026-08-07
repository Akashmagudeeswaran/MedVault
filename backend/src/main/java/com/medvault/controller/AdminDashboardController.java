package com.medvault.controller;

import com.medvault.entity.*;
import com.medvault.repository.*;
import com.medvault.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AIServiceFactory aiServiceFactory;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        Map<String, Object> data = new HashMap<>();

        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalAppointments = appointmentRepository.count();
        long totalMedicalRecords = medicalRecordRepository.count();

        data.put("totalPatients", totalPatients);
        data.put("totalDoctors", totalDoctors);
        data.put("totalAppointments", totalAppointments);
        data.put("totalMedicalRecords", totalMedicalRecords);

        // Fetch recent audit activities and map them (limit to 6)
        List<Map<String, Object>> todaysActivity = auditLogRepository.findAllByOrderByTimestampDesc()
                .stream()
                .limit(6)
                .map(log -> {
                    Map<String, Object> activityMap = new HashMap<>();
                    activityMap.put("userName", log.getUser() != null ? log.getUser().getName() : "System");
                    activityMap.put("activity", log.getDetails() != null ? log.getDetails() : log.getAction());
                    activityMap.put("dateTime", log.getTimestamp());
                    return activityMap;
                })
                .collect(Collectors.toList());
        data.put("todaysActivity", todaysActivity);

        // Generate AI Overview summary
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().plusDays(1).atStartOfDay();

        long todayAppointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getAppointmentDate().isAfter(startOfToday) && a.getAppointmentDate().isBefore(endOfToday))
                .count();

        long newReportsToday = medicalRecordRepository.findAll().stream()
                .filter(r -> r.getCreatedAt().isAfter(startOfToday))
                .count();

        Map<String, Long> specialtyCounts = appointmentRepository.findAll().stream()
                .filter(a -> a.getDoctor() != null)
                .collect(Collectors.groupingBy(a -> a.getDoctor().getSpecialization(), Collectors.counting()));
        String topSpecialty = specialtyCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("General");

        String contextStr = String.format(
                "Hospital operations context: Patients: %d. Doctors: %d. Total Appointments: %d. Total Medical Records: %d. " +
                "Today's scheduled appointments: %d. Busiest department: %s. Medical reports uploaded today: %d.",
                totalPatients, totalDoctors, totalAppointments, totalMedicalRecords,
                todayAppointments, topSpecialty, newReportsToday
        );

        String aiSummary = "AI service is temporarily unavailable. Please try again later.";
        try {
            AIService aiService = aiServiceFactory.getAIService();
            if (aiService instanceof GeminiAIService) {
                String summary = aiService.generateSummary(contextStr);
                if (summary != null && !summary.contains("Failed to retrieve summary from Gemini") && !summary.trim().isEmpty()) {
                    aiSummary = summary;
                }
            } else {
                // If it is LocalAIService, we generate summary directly without checking key
                String summary = aiService.generateSummary(contextStr);
                if (summary != null && !summary.trim().isEmpty()) {
                    aiSummary = summary;
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini overview summary failed: " + e.getMessage());
        }
        data.put("aiSummary", aiSummary);

        // Recommendations
        List<String> recommendations = Arrays.asList(
                "Increase doctor availability on Friday.",
                "Follow up with patients who missed appointments.",
                "Review pending appointments.",
                "Monitor doctors with heavy workloads."
        );
        data.put("recommendations", recommendations);

        // Calculate appointment trends for the last 6 months
        Map<String, Long> trendMap = appointmentRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        a -> a.getAppointmentDate().getMonth().name().substring(0, 3),
                        Collectors.counting()
                ));
        
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        List<Map<String, Object>> appointmentsTrend = new ArrayList<>();
        int added = 0;
        for (String m : months) {
            if (trendMap.containsKey(m) || added > 0 || m.equals("Jul")) {
                Map<String, Object> point = new HashMap<>();
                point.put("month", m);
                point.put("appointments", trendMap.getOrDefault(m, 0L));
                appointmentsTrend.add(point);
                added++;
                if (added >= 6) {
                    break;
                }
            }
        }
        if (appointmentsTrend.isEmpty()) {
            // Seed sample data if database is empty of appointments
            appointmentsTrend.add(Map.of("month", "Jan", "appointments", 5));
            appointmentsTrend.add(Map.of("month", "Feb", "appointments", 12));
            appointmentsTrend.add(Map.of("month", "Mar", "appointments", 18));
            appointmentsTrend.add(Map.of("month", "Apr", "appointments", 15));
            appointmentsTrend.add(Map.of("month", "May", "appointments", 24));
            appointmentsTrend.add(Map.of("month", "Jun", "appointments", 35));
        }
        data.put("appointmentsTrend", appointmentsTrend);

        return ResponseEntity.ok(data);
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> handleChat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null) {
            message = "";
        }

        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalAppointments = appointmentRepository.count();
        long totalMedicalRecords = medicalRecordRepository.count();

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().plusDays(1).atStartOfDay();
        long todayAppts = appointmentRepository.findAll().stream()
                .filter(a -> a.getAppointmentDate().isAfter(startOfToday) && a.getAppointmentDate().isBefore(endOfToday))
                .count();

        long todayPatients = patientRepository.findAll().stream()
                .filter(p -> p.getUser().getCreatedAt().isAfter(startOfToday) && p.getUser().getCreatedAt().isBefore(endOfToday))
                .count();

        long cancelledAppts = appointmentRepository.findAll().stream()
                .filter(a -> "CANCELLED".equalsIgnoreCase(a.getStatus()))
                .count();

        Map<String, Long> specialtyCounts = appointmentRepository.findAll().stream()
                .filter(a -> a.getDoctor() != null)
                .collect(Collectors.groupingBy(a -> a.getDoctor().getSpecialization(), Collectors.counting()));
        String topSpecialty = specialtyCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");

        Map<String, Long> doctorCounts = appointmentRepository.findAll().stream()
                .filter(a -> a.getDoctor() != null)
                .collect(Collectors.groupingBy(a -> a.getDoctor().getUser().getName(), Collectors.counting()));
        String topDoctor = doctorCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> "Dr. " + e.getKey() + " (" + e.getValue() + " appointments)")
                .orElse("None");

        String contextStr = String.format(
                "Hospital live database statistics context: Patients: %d, Doctors: %d, Appointments: %d, Medical Records: %d. " +
                "Patients registered today: %d. Appointments scheduled today: %d. Cancelled appointments: %d. " +
                "Busiest department (clinical specialty): %s. Busiest doctor (most appointments): %s. Current time: %s.",
                totalPatients, totalDoctors, totalAppointments, totalMedicalRecords,
                todayPatients, todayAppts, cancelledAppts,
                topSpecialty, topDoctor, LocalDateTime.now().toString()
        );

        String responseText = "AI service is temporarily unavailable. Please try again later.";
        try {
            AIService aiService = aiServiceFactory.getAIService();
            if (aiService instanceof GeminiAIService) {
                String reply = aiService.chatReply(contextStr, message);
                if (reply != null && !reply.contains("Failed to retrieve reply from Gemini") && !reply.trim().isEmpty()) {
                    responseText = reply;
                }
            } else {
                // If it is LocalAIService, we execute chatReply directly without checking key
                String reply = aiService.chatReply(contextStr, message);
                if (reply != null && !reply.trim().isEmpty()) {
                    responseText = reply;
                }
            }
        } catch (Exception e) {
            System.err.println("Chatbot AI execution failed: " + e.getMessage());
        }

        Map<String, String> response = new HashMap<>();
        response.put("response", responseText);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/activity")
    public ResponseEntity<List<Map<String, Object>>> getHospitalActivity() {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc();
        List<Map<String, Object>> activities = new ArrayList<>();

        for (AuditLog log : logs) {
            Map<String, Object> actMap = new HashMap<>();
            actMap.put("id", log.getId());
            
            String userVal = log.getUser() != null ? log.getUser().getName() : "System";
            actMap.put("user", userVal);

            String roleVal = "Admin";
            if (log.getUser() != null) {
                if (log.getUser().getRole() == UserRole.ROLE_PATIENT) {
                    roleVal = "Patient";
                } else if (log.getUser().getRole() == UserRole.ROLE_DOCTOR) {
                    roleVal = "Doctor";
                }
            }
            actMap.put("role", roleVal);

            String action = log.getAction() != null ? log.getAction() : "";
            
            // Map raw action string to the exact requested activity types
            String activityType = "System Event";
            if (action.contains("PATIENT_REGISTER") || action.contains("REGISTER")) {
                activityType = "New Patient Registered";
            } else if (action.contains("DOCTOR_CREATE") || action.contains("DOCTOR_SIGNUP_SUBMIT") || action.contains("DOCTOR_APPLICATION_APPROVE")) {
                activityType = "New Doctor Added";
            } else if (action.contains("APPOINTMENT_BOOK")) {
                activityType = "Appointment Booked";
            } else if (action.contains("APPOINTMENT_CANCEL")) {
                activityType = "Appointment Cancelled";
            } else if (action.contains("APPOINTMENT_COMPLETE")) {
                activityType = "Appointment Completed";
            } else if (action.contains("RECORD_UPLOAD")) {
                activityType = "Medical Record Uploaded";
            } else if (action.contains("PRESCRIPTION_CREATE")) {
                activityType = "Prescription Created";
            } else if (action.contains("PATIENT_PROFILE_UPDATE") || action.contains("PATIENT_UPDATE")) {
                activityType = "Patient Profile Updated";
            } else if (action.contains("DOCTOR_PROFILE_UPDATE") || action.contains("DOCTOR_UPDATE")) {
                activityType = "Doctor Profile Updated";
            } else if (action.contains("USER_LOGIN") || action.contains("LOGIN")) {
                activityType = "Login Activity";
            } else if (action.contains("USER_LOGOUT") || action.contains("LOGOUT")) {
                activityType = "Logout Activity";
            } else {
                // normalize action name as fallback
                activityType = Arrays.stream(action.split("_"))
                        .map(word -> word.isEmpty() ? "" : word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                        .collect(Collectors.joining(" "));
            }
            actMap.put("activity", activityType);
            
            String details = log.getDetails() != null ? log.getDetails() : log.getAction();
            actMap.put("description", details);
            actMap.put("time", log.getTimestamp());

            activities.add(actMap);
        }

        return ResponseEntity.ok(activities);
    }
}
