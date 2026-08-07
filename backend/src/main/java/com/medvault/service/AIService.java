package com.medvault.service;

public interface AIService {
    String generateSummary(String contextPrompt);
    String chatReply(String chatContext, String userMessage);
    String translateSearchQuery(String userQuery);
}
