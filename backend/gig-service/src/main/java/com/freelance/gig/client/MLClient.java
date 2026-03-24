package com.freelance.gig.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import java.util.List;
import com.freelance.gig.dto.MLRecommendationRequest;
import com.freelance.gig.dto.MLRecommendationScore;
import org.springframework.http.HttpEntity;

@Component
@RequiredArgsConstructor
public class MLClient {
    private final RestTemplate restTemplate;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    public List<MLRecommendationScore> getRecommendations(MLRecommendationRequest request) {
        try {
            String url = mlServiceUrl + "/api/recommend";

            HttpEntity<MLRecommendationRequest> entity = new HttpEntity<>(request);

            ResponseEntity<List<MLRecommendationScore>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<List<MLRecommendationScore>>() {
                    });
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Failed to fetch recommendations from ML service: " + e.getMessage());
            return List.of();
        }
    }
}
