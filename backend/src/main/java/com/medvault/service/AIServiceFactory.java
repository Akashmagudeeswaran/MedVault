package com.medvault.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AIServiceFactory {

    @Value("${gemini.api.key:}")
    private String apiKeyConfig;

    @Autowired
    private GeminiAIService geminiAIService;

    @Autowired
    private LocalAIService localAIService;

    public AIService getAIService() {
        String key = System.getenv("GEMINI_API_KEY");
        if (key == null || key.trim().isEmpty()) {
            key = apiKeyConfig;
        }
        
        if (key != null && !key.trim().isEmpty()) {
            return geminiAIService;
        }
        return localAIService;
    }
}
