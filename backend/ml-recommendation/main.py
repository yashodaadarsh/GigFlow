from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

def overlap_similarity(gig_skills, bidder_skills):
    s1 = set([x.lower().strip() for x in gig_skills])
    s2 = set([x.lower().strip() for x in bidder_skills])
    if not s1 or not s2:
        return 0.0
    # Freelancers shouldn't be penalized for having more skills than what the gig requires
    return len(s1.intersection(s2)) / len(s1)


class Bidder(BaseModel):
    id: int
    skills: List[str]
    rating: float
    completed_gigs: int

class Gig(BaseModel):
    skills: List[str]
    budget: float

class RecommendationRequest(BaseModel):
    gig: Gig
    bidders: List[Bidder]

@app.post("/api/recommend")
async def recommend_bidders(req: RecommendationRequest):
    if not req.bidders:
        return []
    
    gig_skills_str = " ".join(req.gig.skills).lower()
    bidder_skills_strs = [" ".join(b.skills).lower() for b in req.bidders]
    
    corpus = [gig_skills_str] + bidder_skills_strs
    # Handle case where all skills might be identical or empty
    try:
        vectorizer = TfidfVectorizer().fit_transform(corpus)
        vectors = vectorizer.toarray()
        gig_vec = vectors[0]
        bidder_vecs = vectors[1:]
        similarities = cosine_similarity([gig_vec], bidder_vecs)[0]
    except ValueError:
        # e.g., empty vocabulary
        similarities = [0.0] * len(req.bidders)
    
    max_rating = max((b.rating for b in req.bidders), default=1.0)
    if max_rating == 0: max_rating = 1.0
    
    max_completed = max((b.completed_gigs for b in req.bidders), default=1)
    if max_completed == 0: max_completed = 1
    
    scores = []
    
    # Check if platform is new (no one has ratings/exp yet)
    new_platform = (max_rating == 1.0 and max_completed == 1)
    
    for i, b in enumerate(req.bidders):
        tfidf_score = similarities[i]
        overlap_score = overlap_similarity(req.gig.skills, b.skills)
        
        # Combine TF-IDF and Overlap for robust string matching
        skill_score = (0.2 * tfidf_score) + (0.8 * overlap_score)
        
        if new_platform:
            final_score = skill_score
        else:
            rating_score = b.rating / max_rating
            exp_score = b.completed_gigs / max_completed
            final_score = (0.6 * skill_score) + (0.25 * rating_score) + (0.15 * exp_score)
            
        scores.append({
            "bidderId": b.id,
            "score": final_score
        })
    
    scores.sort(key=lambda x: x["score"], reverse=True)
    return scores
