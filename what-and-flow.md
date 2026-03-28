# GigFlow: Project Overview & Core Flows

GigFlow is a premium, AI-powered gig-matching platform designed for elite freelancers and forward-thinking organizations. It bridges the gap between hiring needs and technical talent through a highly automated, secure, and real-time experience.

## What is GigFlow?

At its core, GigFlow is a microservices-driven ecosystem that streamlines the entire lifecycle of a freelance project—from discovery and matching to communication, execution, and secure payment.

### The "Why"
Traditional freelance platforms often suffer from:
- **Noise**: Low-quality responses and manual filtering.
- **Friction**: Clunky communication and fragmented project management.
- **Risk**: Payment uncertainty for freelancers and delivery risk for hirers.

**GigFlow solves this through:**
1. **AI-Driven Matching**: Using vector embeddings and skill-similarity algorithms to bypass manual searching.
2. **Integrated Real-time Suite**: Built-in chat and WebRTC video calling for seamless technical interviews.
3. **Escrow Guarantee**: A secure payment system that protects both parties until milestones are approved.
4. **Dev-Centric UX**: A modern, dark-mode-first interface focused on speed and productivity.

---

## Technical Architecture

GigFlow follows an **Asynchronous Microservices Architecture** to ensure scalability and resilience.

### Service Map
- **Auth Service (Spring Boot)**: Handles role-based authentication (Hirer/Bidder) and JWT security.
- **Gig Service (Spring Boot)**: Manages the lifecycle of gigs (Post, Browse, Filter).
- **Notification Service (Spring Boot/STOMP)**: Powers real-time UI updates (e.g., "New Bid Received").
- **Communication Service (Node.js/WebRTC)**: Handles real-time chat (Socket.io) and video call signaling.
- **Payment Service (Node.js/Express)**: Manages escrow records and transaction states.
- **ML Recommendation**: A specialized layer for matching bidders to gigs based on skill vectors.

---

## Core User Flows

### 1. The Onboarding Flow
1. **Sign Up**: User chooses a role (**Hirer** or **Bidder**).
2. **Profile Completion**:
   - **Hirers** provide organization details and gig history.
   - **Bidders** list skills, experience, and bank details for payouts.

### 2. The Gig & Bidding Lifecycle
1. **Post Gig**: A Hirer creates a gig with title, description, budget, and required skills.
2. **Discovery**:
   - **Manual**: Bidders search and filter for gigs that match their interests.
   - **Automated**: The ML system notifies top-matched Bidders of the new opportunity.
3. **Bidding**: Bidders submit proposals with their budget and timeline.
4. **Real-time Review**: Hirers see new bids instantly via WebSockets without refreshing the page.

### 3. The Communication & Interview Flow
1. **Initial Outreach**: Hirer initiates a chat with a promising Bidder.
2. **Technical Interview**:
   - If deeper discussion is needed, the Hirer can start a **Video Call**.
   - Signaling is handled via WebRTC for low-latency, high-quality interaction.
3. **Decision**: Once satisfied, the Hirer clicks **"Hire"** on the specific bid.

### 4. The Execution & Payment Flow
1. **Escrow Initialization**: Upon hiring, the Gig status moves to `HIRED` or `ONGOING`.
2. **Project Panel**: Both parties get access to a dedicated project workspace with file sharing and status tracking.
3. **Milestone Completion**: As the Bidder submits work, the Hirer reviews and approves.
4. **Escrow Release**: Approved milestones trigger the release of funds from the secure escrow account to the Bidder's bank profile.

---

## Visual Summary of Technology

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS, Framer Motion, Redux Toolkit |
| **Backend Core** | Spring Boot (Java), Node.js (Express) |
| **Real-time** | Socket.io, STOMP/WebSockets, WebRTC |
| **Data Stores** | PostgreSQL, MySQL, Redis |
| **Styling** | Vanilla CSS + Advanced UI Tokens |
