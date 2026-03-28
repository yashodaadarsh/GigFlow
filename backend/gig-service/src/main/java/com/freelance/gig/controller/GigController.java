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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gigs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GigController {

    private final GigService gigService;
    private final JwtService jwtService;

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            Claims claims = jwtService.extractAllClaims(jwt);
            Object userId = claims.get("userId");
            if (userId != null) {
                return Long.valueOf(userId.toString());
            }
        }
        return -1L;
    }

    @PostMapping
    public ResponseEntity<GigResponse> createGig(@RequestBody GigRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(gigService.createGig(request, extractUserId(httpRequest)));
    }

    @GetMapping
    public ResponseEntity<List<GigResponse>> getGigs() {
        return ResponseEntity.ok(gigService.getOpenGigs());
    }

    @GetMapping("/my-gigs")
    public ResponseEntity<List<GigResponse>> getMyGigs(HttpServletRequest httpRequest) {
        return ResponseEntity.ok(gigService.getGigsByHirerId(extractUserId(httpRequest)));
    }

    @GetMapping("/my-bids")
    public ResponseEntity<List<GigResponse>> getMyBiddedGigs(HttpServletRequest httpRequest) {
        return ResponseEntity.ok(gigService.getGigsBiddedBy(extractUserId(httpRequest)));
    }

    /** Bidder: get gigs they've been assigned/hired for */
    @GetMapping("/assigned")
    public ResponseEntity<List<GigResponse>> getAssignedGigs(HttpServletRequest httpRequest) {
        return ResponseEntity.ok(gigService.getGigsAssignedToBidder(extractUserId(httpRequest)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GigResponse> getGigById(@PathVariable Long id) {
        return ResponseEntity.ok(gigService.getGigById(id));
    }

    @PostMapping("/{id}/bids")
    public ResponseEntity<Void> placeBid(@PathVariable Long id, @RequestBody BidRequest request,
            HttpServletRequest httpRequest) {
        gigService.placeBid(id, request, extractUserId(httpRequest));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/bids")
    public ResponseEntity<List<Bid>> getBidsForGig(@PathVariable Long id) {
        return ResponseEntity.ok(gigService.getBidsForGig(id));
    }

    /** Hirer hires a specific bidder for a gig */
    @PostMapping("/{gigId}/hire/{bidderId}")
    public ResponseEntity<?> hireForGig(
            @PathVariable Long gigId,
            @PathVariable Long bidderId,
            HttpServletRequest httpRequest) {
        Long hirerId = extractUserId(httpRequest);
        try {
            GigResponse response = gigService.hireForGig(gigId, bidderId, hirerId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
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
