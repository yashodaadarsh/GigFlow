package com.freelance.gig.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.HashMap;

@Component
@RequiredArgsConstructor
public class NotificationClient {
    private final RestTemplate restTemplate;

    @Value("${notification.service.url}")
    private String notificationServiceUrl;

    public void sendNotification(Long userId, String message) {
        try {
            String url = notificationServiceUrl + "/api/notifications/notify";
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("message", message);
            restTemplate.postForEntity(url, payload, Void.class);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }
}
