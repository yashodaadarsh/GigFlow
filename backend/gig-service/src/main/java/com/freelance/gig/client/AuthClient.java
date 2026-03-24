package com.freelance.gig.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.stream.Collectors;
import com.freelance.gig.dto.UserProfileDto;

@Component
@RequiredArgsConstructor
public class AuthClient {
    private final RestTemplate restTemplate;

    // Hardcode port for now since we're using distinct local microservices without
    // a registry
    private final String authServiceUrl = "http://localhost:8081";

    public List<UserProfileDto> getUsers(List<Long> userIds) {
        try {
            String idsParam = userIds.stream().map(String::valueOf).collect(Collectors.joining(","));
            String url = authServiceUrl + "/api/auth/users?ids=" + idsParam;

            ResponseEntity<List<UserProfileDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<UserProfileDto>>() {
                    });
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Failed to fetch users from auth service: " + e.getMessage());
            return List.of();
        }
    }
}
