package com.freelance.gig.controller;

import com.freelance.gig.dto.GigRequest;
import com.freelance.gig.dto.GigResponse;
import com.freelance.gig.dto.BidRequest;
import com.freelance.gig.dto.MLRecommendationScore;
import com.freelance.gig.entity.Bid;
import com.freelance.gig.entity.GigStatus;
import com.freelance.gig.security.JwtService;
import com.freelance.gig.service.GigService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gigs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For development
public class GigController {

    private final GigService gigService;
    private final JwtService jwtService;

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            Claims claims = jwtService.extractAllClaims(jwt);
            return claims.get("userId", Long.class);
        }
        return -1L; // fallback
    }

    @PostMapping
    public ResponseEntity<GigResponse> createGig(@RequestBody GigRequest request, HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        return ResponseEntity.ok(gigService.createGig(request, userId));
    }

    @GetMapping
    public ResponseEntity<List<GigResponse>> getGigs() {
        return ResponseEntity.ok(gigService.getOpenGigs());
    }

    @GetMapping("/my-gigs")
    public ResponseEntity<List<GigResponse>> getMyGigs(HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        return ResponseEntity.ok(gigService.getGigsByHirerId(userId));
    }

    @GetMapping("/my-bids")
    public ResponseEntity<List<GigResponse>> getMyBiddedGigs(HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        return ResponseEntity.ok(gigService.getGigsBiddedBy(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GigResponse> getGigById(@PathVariable Long id) {
        return ResponseEntity.ok(gigService.getGigById(id));
    }

    @PostMapping("/{id}/bids")
    public ResponseEntity<Void> placeBid(@PathVariable Long id, @RequestBody BidRequest request,
            HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        gigService.placeBid(id, request, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/bids")
    public ResponseEntity<List<Bid>> getBidsForGig(@PathVariable Long id) {
        return ResponseEntity.ok(gigService.getBidsForGig(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestParam GigStatus status) {
        gigService.updateGigStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<MLRecommendationScore>> getRecommendations(@PathVariable Long id) {
        return ResponseEntity.ok(gigService.getRecommendations(id));
    }
}
