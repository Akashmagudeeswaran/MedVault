package com.medvault.controller;

import com.medvault.service.AIAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AIAnalyticsController {

    @Autowired
    private AIAnalyticsService aiAnalyticsService;

    @GetMapping("/analytics/overview")
    public ResponseEntity<Map<String, Object>> getOverviewStats() {
        return ResponseEntity.ok(aiAnalyticsService.getOverviewStats());
    }

    @GetMapping("/analytics/doctors")
    public ResponseEntity<List<Map<String, Object>>> getDoctorsWorkload() {
        return ResponseEntity.ok(aiAnalyticsService.getDoctorsWorkload());
    }

    @GetMapping("/analytics/patients")
    public ResponseEntity<Map<String, Object>> getPatientsAnalysis() {
        return ResponseEntity.ok(aiAnalyticsService.getPatientsAnalysis());
    }

    @GetMapping("/analytics/diseases")
    public ResponseEntity<Map<String, Object>> getDiseaseAnalytics() {
        return ResponseEntity.ok(aiAnalyticsService.getDiseaseAnalytics());
    }

    @GetMapping("/analytics/appointments")
    public ResponseEntity<Map<String, Object>> getAppointmentsAnalysis() {
        return ResponseEntity.ok(aiAnalyticsService.getAppointmentsAnalysis());
    }

    @GetMapping("/analytics/recommendations")
    public ResponseEntity<List<String>> getRecommendations() {
        return ResponseEntity.ok(aiAnalyticsService.getRecommendations());
    }

    @GetMapping("/analytics/search")
    public ResponseEntity<List<?>> executeAISearch(@RequestParam String query) {
        return ResponseEntity.ok(aiAnalyticsService.executeAISearch(query));
    }

    @PostMapping("/ai/chat")
    public ResponseEntity<Map<String, String>> handleAIChat(@RequestBody Map<String, String> request) {
        String query = request.get("message");
        if (query == null || query.trim().isEmpty()) {
            query = "hello";
        }
        String reply = aiAnalyticsService.handleAIChat(query);
        Map<String, String> response = new HashMap<>();
        response.put("reply", reply);
        return ResponseEntity.ok(response);
    }
}
