package com.freelance.gig.dto;

import com.freelance.gig.entity.GigStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class GigResponse {
    private Long id;
    private String title;
    private String description;
    private java.util.List<String> skillsRequired;
    private Double budget;
    private LocalDateTime startDate;
    private LocalDateTime deadline;
    private GigStatus status;
}
