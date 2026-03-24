package com.freelance.gig.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MLRecommendationScore {
    private Long bidderId;
    private String bidderName;
    private Double score;
}
