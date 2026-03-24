package com.freelance.auth.service;

import com.freelance.auth.dto.AuthResponse;
import com.freelance.auth.dto.LoginRequest;
import com.freelance.auth.dto.SignupRequest;
import com.freelance.auth.entity.User;
import com.freelance.auth.repository.UserRepository;
import com.freelance.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.freelance.auth.dto.UserProfileDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {
        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final ObjectMapper objectMapper;

        public AuthResponse signup(SignupRequest request) {
                if (repository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already exists");
                }

                String skillsJson = null;
                try {
                        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
                                skillsJson = objectMapper.writeValueAsString(request.getSkills());
                        }
                } catch (JsonProcessingException e) {
                        throw new RuntimeException("Failed to serialize skills", e);
                }

                var user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .phone(request.getPhone())
                                .role(request.getRole())
                                .organisation(request.getOrganisation())
                                .bankDetails(request.getBankDetails())
                                .skills(skillsJson)
                                .build();
                repository.save(user);

                var claims = new java.util.HashMap<String, Object>();
                claims.put("userId", user.getId());
                claims.put("role", user.getRole().name());
                var jwtToken = jwtService.generateToken(claims, user);
                return AuthResponse.builder()
                                .token(jwtToken)
                                .userId(user.getId())
                                .name(user.getName())
                                .role(user.getRole())
                                .build();
        }

        public AuthResponse login(LoginRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = repository.findByEmail(request.getEmail())
                                .orElseThrow();
                var claims = new java.util.HashMap<String, Object>();
                claims.put("userId", user.getId());
                claims.put("role", user.getRole().name());
                var jwtToken = jwtService.generateToken(claims, user);
                return AuthResponse.builder()
                                .token(jwtToken)
                                .userId(user.getId())
                                .name(user.getName())
                                .role(user.getRole())
                                .build();
        }

        public List<UserProfileDto> getUsersByIds(List<Long> userIds) {
                return repository.findAllById(userIds).stream()
                                .map(this::mapToUserProfileDto)
                                .collect(Collectors.toList());
        }

        private UserProfileDto mapToUserProfileDto(User user) {
                List<String> skillsList = null;
                try {
                        if (user.getSkills() != null && !user.getSkills().isEmpty()) {
                                skillsList = objectMapper.readValue(user.getSkills(), List.class);
                        }
                } catch (Exception e) {
                        // Ignore parsing errors for individual users, skills remain null
                }

                return UserProfileDto.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole() != null ? user.getRole().name() : null)
                                .organisation(user.getOrganisation())
                                .rating(user.getRating() != null ? user.getRating().doubleValue() : 0.0)
                                .completedGigs(user.getCompletedGigs())
                                .skills(skillsList)
                                .build();
        }
}
