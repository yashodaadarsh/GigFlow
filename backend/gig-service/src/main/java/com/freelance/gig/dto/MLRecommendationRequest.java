package com.freelance.gig.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MLRecommendationRequest {
    private Gig gig;
    private List<Bidder> bidders;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Gig {
        private List<String> skills;
        private Double budget;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Bidder {
        private Long id;
        private List<String> skills;
        private Double rating;
        private Integer completed_gigs;
    }
}
