package com.freelance.notification.controller;

import com.freelance.notification.dto.NotificationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For development
public class NotificationController {

    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/notify")
    public void sendNotification(@RequestBody NotificationRequest request) {
        String destination = "/topic/notifications/" + request.getUserId();
        messagingTemplate.convertAndSend(destination, request.getMessage());
        System.out.println("Sent notification to " + destination + ": " + request.getMessage());
    }
}
