package com.freelance.notification.controller;

import com.freelance.notification.entity.Notification;
import com.freelance.notification.service.NotificationService;
import com.freelance.notification.dto.NotificationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/notify")
    public void sendNotification(@RequestBody NotificationRequest request) {
        notificationService.sendAndSaveNotification(request);
    }

    @GetMapping
    public List<Notification> getNotifications(@RequestParam Long userId) {
        return notificationService.getNotificationsForUser(userId);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @PutMapping("/read-all")
    public void markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
    }
}
