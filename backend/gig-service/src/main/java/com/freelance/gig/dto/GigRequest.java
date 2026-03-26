package com.freelance.gig.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GigRequest {
    private String title;
    private String description;
    private java.util.List<String> skillsRequired;
    private Double budget;
    private LocalDateTime startDate;
    private LocalDateTime deadline;
}
