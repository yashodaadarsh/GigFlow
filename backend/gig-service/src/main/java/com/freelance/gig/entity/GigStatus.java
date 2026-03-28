package com.freelance.gig.entity;

public enum GigStatus {
    OPEN,
    ASSIGNED,      // Hirer hired a bidder, work not yet started
    ONGOING,       // Work in progress
    COMPLETED,     // Work done, pending payment
    PAYMENT_PENDING, // Awaiting Razorpay payment
    DELIVERED,     // Paid and delivered
    MONEY_RELATED, // Legacy / disputes
    HIRED          // Legacy alias for ASSIGNED
}
