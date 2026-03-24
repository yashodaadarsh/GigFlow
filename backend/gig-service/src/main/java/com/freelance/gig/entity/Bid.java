package com.freelance.gig.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bids")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gig_id", nullable = false)
    private Long gigId;

    @Column(name = "bidder_id", nullable = false)
    private Long bidderId; // Bidder ID

    @Column(columnDefinition = "TEXT")
    private String proposal;

    private Double budget;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
