package com.freelance.gig.repository;

import com.freelance.gig.entity.Gig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GigRepository extends JpaRepository<Gig, Long> {
    List<Gig> findByPostedBy(Long postedBy);
}
