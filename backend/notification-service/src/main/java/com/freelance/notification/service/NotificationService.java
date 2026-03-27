package com.freelance.notification.service;

import com.freelance.notification.entity.Notification;
import com.freelance.notification.repository.NotificationRepository;
import com.freelance.notification.dto.NotificationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void sendAndSaveNotification(NotificationRequest request) {
        // Save to DB
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .message(request.getMessage())
                .type(request.getType())
                .relatedId(request.getRelatedId())
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        // Send real-time via WebSocket (STOMP)
        String destination = "/topic/notifications/" + request.getUserId();
        // Send the entire request object so frontend can handle type and relatedId
        messagingTemplate.convertAndSend(destination, request);
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}
