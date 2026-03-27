package com.freelance.gig.service;

import com.freelance.gig.client.NotificationClient;
import com.freelance.gig.client.AuthClient;
import com.freelance.gig.client.MLClient;
import com.freelance.gig.dto.GigRequest;
import com.freelance.gig.dto.GigResponse;
import com.freelance.gig.dto.BidRequest;
import com.freelance.gig.dto.MLRecommendationRequest;
import com.freelance.gig.dto.MLRecommendationScore;
import com.freelance.gig.dto.UserProfileDto;
import com.freelance.gig.entity.Gig;
import com.freelance.gig.entity.Bid;
import com.freelance.gig.entity.GigStatus;
import com.freelance.gig.repository.GigRepository;
import com.freelance.gig.repository.BidRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GigService {

    private final GigRepository gigRepository;
    private final BidRepository bidRepository;
    private final NotificationClient notificationClient;
    private final AuthClient authClient;
    private final MLClient mlClient;
    private final ObjectMapper objectMapper;

    public GigResponse createGig(GigRequest request, Long hirerId) {
        String skillsJson = "";
        try { skillsJson = objectMapper.writeValueAsString(request.getSkillsRequired()); } catch (Exception e) {}

        Gig gig = Gig.builder()
                .postedBy(hirerId)
                .title(request.getTitle())
                .description(request.getDescription())
                .skillsRequired(skillsJson)
                .budget(request.getBudget())
                .startDate(request.getStartDate())
                .deadline(request.getDeadline())
                .build();
        return mapToResponse(gigRepository.save(gig));
    }

    public List<GigResponse> getOpenGigs() {
        return gigRepository.findAll().stream()
                .filter(g -> g.getStatus() == GigStatus.OPEN)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<GigResponse> getGigsByHirerId(Long hirerId) {
        return gigRepository.findAll().stream()
                .filter(g -> g.getPostedBy().equals(hirerId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public GigResponse getGigById(Long id) {
        return gigRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Gig not found"));
    }

    public void updateGigStatus(Long id, GigStatus status) {
        Gig gig = gigRepository.findById(id).orElseThrow();
        gig.setStatus(status);
        gigRepository.save(gig);
    }

    /**
     * Hire a bidder for a specific gig.
     * Sets status = ASSIGNED and records hiredBidderId.
     * Notifies bidder via notification service.
     */
    public GigResponse hireForGig(Long gigId, Long bidderId, Long hirerId) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new RuntimeException("Gig not found"));

        if (!gig.getPostedBy().equals(hirerId)) {
            throw new RuntimeException("Only the gig owner can hire");
        }

        gig.setStatus(GigStatus.ASSIGNED);
        gig.setHiredBidderId(bidderId);
        Gig saved = gigRepository.save(gig);

        // Notify bidder they've been hired
        notificationClient.sendNotification(
                bidderId,
                "🎉 Congratulations! You've been hired for: " + gig.getTitle(),
                "HIRED",
                gigId
        );

        return mapToResponse(saved);
    }

    /**
     * Get gigs where this user is the hired bidder (for bidder's assigned/ongoing view)
     */
    public List<GigResponse> getGigsAssignedToBidder(Long bidderId) {
        return gigRepository.findAll().stream()
                .filter(g -> bidderId.equals(g.getHiredBidderId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void placeBid(Long gigId, BidRequest request, Long bidderId) {
        Gig gig = gigRepository.findById(gigId).orElseThrow();
        if (gig.getStatus() != GigStatus.OPEN) {
            throw new RuntimeException("Gig is not open for bids");
        }
        if (bidRepository.existsByGigIdAndBidderId(gigId, bidderId)) {
            throw new RuntimeException("You have already placed a bid on this gig");
        }
        Bid bid = Bid.builder()
                .gigId(gigId)
                .bidderId(bidderId)
                .proposal(request.getProposal())
                .budget(request.getBudget())
                .build();
        bidRepository.save(bid);
        notificationClient.sendNotification(gig.getPostedBy(), "New bid on gig: " + gig.getTitle());
    }

    public List<Bid> getBidsForGig(Long gigId) {
        return bidRepository.findByGigId(gigId);
    }

    public List<MLRecommendationScore> getRecommendations(Long gigId) {
        Gig gig = gigRepository.findById(gigId).orElseThrow(() -> new RuntimeException("Gig not found"));
        List<Bid> bids = bidRepository.findByGigId(gigId);
        if (bids.isEmpty()) return new ArrayList<>();

        List<Long> bidderIds = bids.stream().map(Bid::getBidderId).distinct().collect(Collectors.toList());
        List<UserProfileDto> userProfiles = authClient.getUsers(bidderIds);

        MLRecommendationRequest mlReq = new MLRecommendationRequest();
        List<String> gigSkills = new ArrayList<>();
        try {
            if (gig.getSkillsRequired() != null && !gig.getSkillsRequired().isEmpty()) {
                gigSkills = objectMapper.readValue(gig.getSkillsRequired(), List.class);
            }
        } catch (Exception e) {}

        mlReq.setGig(MLRecommendationRequest.Gig.builder()
                .skills(gigSkills)
                .budget(gig.getBudget() != null ? gig.getBudget() : 0.0)
                .build());

        List<MLRecommendationRequest.Bidder> mlBidders = new ArrayList<>();
        for (UserProfileDto profile : userProfiles) {
            mlBidders.add(MLRecommendationRequest.Bidder.builder()
                    .id(profile.getId())
                    .skills(profile.getSkills() != null ? profile.getSkills() : new ArrayList<>())
                    .rating(profile.getRating() != null ? profile.getRating() : 0.0)
                    .completed_gigs(profile.getCompletedGigs() != null ? profile.getCompletedGigs() : 0)
                    .build());
        }
        mlReq.setBidders(mlBidders);

        List<MLRecommendationScore> scores = mlClient.getRecommendations(mlReq);
        if (scores != null) {
            java.util.Map<Long, String> idToName = userProfiles.stream()
                    .collect(Collectors.toMap(UserProfileDto::getId, UserProfileDto::getName, (a, b) -> a));
            scores.forEach(s -> s.setBidderName(idToName.getOrDefault(s.getBidderId(), "Unknown")));
        }
        return (scores != null && scores.size() > 5) ? scores.subList(0, 5) : (scores != null ? scores : new ArrayList<>());
    }

    public List<GigResponse> getGigsBiddedBy(Long bidderId) {
        List<Bid> bids = bidRepository.findByBidderId(bidderId);
        List<Long> gigIds = bids.stream().map(Bid::getGigId).distinct().collect(Collectors.toList());
        return gigRepository.findAllById(gigIds).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private GigResponse mapToResponse(Gig gig) {
        List<String> skillsList = new ArrayList<>();
        try {
            if (gig.getSkillsRequired() != null && !gig.getSkillsRequired().isEmpty()) {
                skillsList = objectMapper.readValue(gig.getSkillsRequired(), List.class);
            }
        } catch (Exception e) {}

        return GigResponse.builder()
                .id(gig.getId())
                .hirerId(gig.getPostedBy())
                .hiredBidderId(gig.getHiredBidderId())
                .title(gig.getTitle())
                .description(gig.getDescription())
                .skillsRequired(skillsList)
                .budget(gig.getBudget())
                .startDate(gig.getStartDate())
                .deadline(gig.getDeadline())
                .status(gig.getStatus())
                .build();
    }
}
