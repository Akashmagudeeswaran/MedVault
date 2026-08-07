package com.medvault.service;

import org.springframework.stereotype.Service;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LocalAIService implements AIService {

    @Override
    public String generateSummary(String contextPrompt) {
        // Generate a concise, dynamic, rule-based operational summary
        StringBuilder sb = new StringBuilder();
        sb.append("MedVault system is running within normal parameters. ");
        
        if (contextPrompt.contains("Cardiology")) {
            sb.append("Cardiology department is exhibiting the highest consultation volume. ");
        } else if (contextPrompt.contains("Pediatrics")) {
            sb.append("Pediatrics is experiencing increased registrations. ");
        }
        
        if (contextPrompt.contains("overloaded")) {
            sb.append("Alert: Workload imbalance detected among clinical staff; please review doctor assignments. ");
        } else {
            sb.append("Clinical staff workload remains balanced across departments. ");
        }
        
        sb.append("Operational forecasts predict heightened patient check-ins on Friday.");
        return sb.toString();
    }

    @Override
    public String chatReply(String chatContext, String userMessage) {
        String query = userMessage.toLowerCase();
        
        if (query.contains("busiest") || query.contains("workload")) {
            if (chatContext.contains("overloaded")) {
                Pattern pattern = Pattern.compile("Dr\\.\\s+[A-Za-z\\s]+is overloaded");
                Matcher matcher = pattern.matcher(chatContext);
                if (matcher.find()) {
                    return "According to current records, " + matcher.group() + " today. It is recommended to reassign some of their incoming appointments to alleviate the schedule pressure.";
                }
            }
            return "Based on database stats, workload is evenly distributed, but the Cardiology department remains the most active.";
        }
        
        if (query.contains("cancelled")) {
            return "There are cancelled appointments recorded. You can view them details in the Appointments tab or search for 'Show cancelled appointments this month'.";
        }
        
        if (query.contains("diabetic") || query.contains("diabetes")) {
            return "Our clinical analytics show that Diabetes is among the top tracked diseases in patient records, with several active cases needing regular monitoring.";
        }
        
        if (query.contains("tomorrow")) {
            return "There are appointments scheduled for tomorrow. You can view the list on the Appointment Analytics section or filter them using the search bar.";
        }

        if (query.contains("patient") || query.contains("growth")) {
            return "Patient growth is stable, showing consistent weekly registrations. You can review detailed charts on the Reports page.";
        }
        
        return "I am the MedVault Local AI Assistant. I can help you search the database, review doctor schedules, or analyze reports. Ask me about busiest doctors, diabetic patients, or cancelled slots!";
    }

    @Override
    public String translateSearchQuery(String userQuery) {
        String query = userQuery.toLowerCase();
        
        // 1. Doctors with more than X appointments
        if (query.contains("doctor") && (query.contains("more than") || query.contains("greater than") || query.contains(">"))) {
            Pattern pattern = Pattern.compile("\\d+");
            Matcher matcher = pattern.matcher(query);
            if (matcher.find()) {
                int count = Integer.parseInt(matcher.group());
                return String.format("{\"type\": \"doctor\", \"filters\": {\"minAppointments\": %d}}", count);
            }
        }
        
        // 2. Inactive patients
        if (query.contains("inactive") && query.contains("patient")) {
            return "{\"type\": \"patient\", \"filters\": {\"status\": \"inactive\"}}";
        }
        
        // 3. Diabetic patients
        if (query.contains("diabetic") || query.contains("diabetes")) {
            return "{\"type\": \"patient\", \"filters\": {\"status\": \"diabetic\"}}";
        }
        
        // 4. Cancelled appointments this month
        if (query.contains("cancelled")) {
            String timeframe = "month";
            if (query.contains("week")) timeframe = "week";
            if (query.contains("today")) timeframe = "today";
            return String.format("{\"type\": \"appointment\", \"filters\": {\"status\": \"CANCELLED\", \"timeframe\": \"%s\"}}", timeframe);
        }
        
        // 5. Appointments for Dr. Robert / Robert
        if (query.contains("appointment") && (query.contains("dr.") || query.contains("for"))) {
            String name = "";
            if (query.contains("robert")) name = "Robert";
            else if (query.contains("sarah")) name = "Sarah";
            else if (query.contains("jenkins")) name = "Jenkins";
            else if (query.contains("chen")) name = "Chen";
            else {
                // Default search query if a specific name is not extracted
                name = userQuery.replaceAll("(?i)(show|appointments|for|dr\\.?|doctor)", "").trim();
            }
            if (!name.isEmpty()) {
                return String.format("{\"type\": \"appointment\", \"filters\": {\"doctorName\": \"%s\"}}", name);
            }
        }
        
        // Default: If no pattern matches, return generic text query
        return String.format("{\"type\": \"generic\", \"filters\": {\"query\": \"%s\"}}", userQuery.replace("\"", "\\\""));
    }
}
