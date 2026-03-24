package com.freelance.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Hirer specific
    private String organisation;
    @Column(name = "gigs_posted")
    private Integer gigsPosted;

    // Bidder specific
    @Column(name = "bank_details")
    private String bankDetails;
    private Double rating;
    @Column(columnDefinition = "json")
    private String skills; // Stored as JSON array string for simplicity

    @Column(name = "assigned_gigs")
    private Integer assignedGigs;

    @Column(name = "completed_gigs")
    private Integer completedGigs;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (role == Role.BIDDER) {
            if (rating == null)
                rating = 0.0;
            if (assignedGigs == null)
                assignedGigs = 0;
            if (completedGigs == null)
                completedGigs = 0;
        } else if (role == Role.HIRER) {
            if (gigsPosted == null)
                gigsPosted = 0;
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
