package com.freelance.auth.controller;

import com.freelance.auth.dto.AuthResponse;
import com.freelance.auth.dto.LoginRequest;
import com.freelance.auth.dto.SignupRequest;
import com.freelance.auth.dto.UserProfileDto;
import com.freelance.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For development
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
            @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileDto>> getUsers(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(authService.getUsersByIds(ids));
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<UserProfileDto> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getUsersByIds(List.of(id)).stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found")));
    }
}
