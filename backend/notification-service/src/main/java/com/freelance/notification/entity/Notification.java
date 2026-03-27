package com.freelance.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private String type; // e.g., 'HIRED', 'CHAT', 'VIDEO_CALL', 'STATUS_UPDATE'
    
    private boolean isRead = false;
    
    private Long relatedId; // e.g., gigId or peerId
    
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
