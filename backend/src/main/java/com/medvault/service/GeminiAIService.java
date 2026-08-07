package com.medvault.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAIService implements AIService {

    @Value("${gemini.api.key:}")
    private String apiKeyConfig;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getApiKey() {
        String key = System.getenv("GEMINI_API_KEY");
        if (key == null || key.trim().isEmpty()) {
            key = apiKeyConfig;
        }
        return key;
    }

    private String callGemini(String prompt) {
        String apiKey = getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("Gemini API key is not configured");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct payload using Map structures
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> contentPart = new HashMap<>();
            contentPart.put("parts", List.of(textPart));

            Map<String, Object> payload = new HashMap<>();
            payload.put("contents", List.of(contentPart));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode textNode = candidates.get(0)
                            .path("content")
                            .path("parts");
                    if (textNode.isArray() && !textNode.isEmpty()) {
                        return textNode.get(0).path("text").asText().trim();
                    }
                }
            }
            throw new RuntimeException("Unexpected response format from Gemini API");
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            return null; // Fallback will handle null response
        }
    }

    @Override
    public String generateSummary(String contextPrompt) {
        String prompt = "You are the MedVault AI hospital administrator. Analyze the following hospital status and metrics:\n\n"
                + contextPrompt + "\n\n"
                + "Provide a concise, professional 3-sentence summary of current hospital operations, identifying key highlights, workload alerts, or patient trends. Do not use bullet points or lists in your output.";
        
        String response = callGemini(prompt);
        return response != null ? response : "Failed to retrieve summary from Gemini.";
    }

    @Override
    public String chatReply(String chatContext, String userMessage) {
        String prompt = "You are the MedVault AI assistant. Help the administrator with their question. Here is the current hospital database context:\n\n"
                + chatContext + "\n\n"
                + "User Question: " + userMessage + "\n\n"
                + "Provide a helpful, precise answer based strictly on the provided context.";
        
        String response = callGemini(prompt);
        return response != null ? response : "Failed to retrieve reply from Gemini.";
    }

    @Override
    public String translateSearchQuery(String userQuery) {
        String prompt = "Translate this natural language search query about hospital records into a search action: '" + userQuery + "'\n"
                + "Return ONLY a valid JSON object matching one of these structures, with NO markdown formatting, NO backticks, and NO extra text:\n"
                + "For doctor searches:\n"
                + "{\"type\": \"doctor\", \"filters\": {\"minAppointments\": X, \"name\": \"...\"}}\n"
                + "For patient searches:\n"
                + "{\"type\": \"patient\", \"filters\": {\"status\": \"inactive\"|\"diabetic\"|\"high_risk\"}}\n"
                + "For appointment searches:\n"
                + "{\"type\": \"appointment\", \"filters\": {\"status\": \"CANCELLED\"|\"PENDING\"|\"COMPLETED\", \"doctorName\": \"...\", \"timeframe\": \"month\"|\"week\"|\"today\"}}\n"
                + "If no structure matches, return:\n"
                + "{\"type\": \"generic\", \"filters\": {\"query\": \"" + userQuery.replace("\"", "\\\"") + "\"}}";
        
        String response = callGemini(prompt);
        if (response != null) {
            // Strip any markdown code fence if AI returned it
            response = response.replaceAll("```json", "").replaceAll("```", "").trim();
            return response;
        }
        return "{\"type\": \"generic\", \"filters\": {\"query\": \"" + userQuery.replace("\"", "\\\"") + "\"}}";
    }
}
