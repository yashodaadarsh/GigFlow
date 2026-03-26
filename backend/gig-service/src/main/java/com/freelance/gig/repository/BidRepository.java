package com.freelance.gig.repository;

import com.freelance.gig.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByGigId(Long gigId);

    List<Bid> findByBidderId(Long bidderId);

    boolean existsByGigIdAndBidderId(Long gigId, Long bidderId);
}
