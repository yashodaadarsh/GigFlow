package com.freelance.gig.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gigs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Gig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "posted_by", nullable = false)
    private Long postedBy; // Hirer ID

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "skills_required", columnDefinition = "json")
    private String skillsRequired;

    private Double budget;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    private LocalDateTime deadline;

    @Column(name = "posted_date_time")
    private LocalDateTime postedDateTime;

    @Enumerated(EnumType.STRING)
    private GigStatus status;

    @PrePersist
    public void prePersist() {
        if (postedDateTime == null) {
            postedDateTime = LocalDateTime.now();
        }
        if (status == null) {
            status = GigStatus.OPEN;
        }
    }
}
