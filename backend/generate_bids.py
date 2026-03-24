import requests
import random
import string
import time
import sys

# Configuration
AUTH_URL = "http://localhost:8081/api/auth"
GIG_URL = "http://localhost:8082/api/gigs"
GIG_ID = 11 # We will try to post to Gig #11

# Possible Tech Skills
ALL_SKILLS = ["React", "Java", "Spring Boot", "Python", "FastAPI", "Node.js", "Docker", "AWS", "SQL", "MongoDB", "Tailwind", "Angular", "Vue", "Kubernetes", "Redis", "Kafka"]

def random_string(length=8):
    return ''.join(random.choices(string.ascii_letters, k=length))

def generate_random_bidder(index):
    skills_count = random.randint(1, 5)
    skills = random.sample(ALL_SKILLS, skills_count)
    
    return {
        "name": f"Test Bidder {index}",
        "email": f"bidder{index}_{random_string(4)}@test.com",
        "password": "password123",
        "phone": "1234567890",
        "role": "BIDDER",
        "skills": skills
    }

print("Starting to generate 30 Bidders...")

for i in range(1, 31):
    bidder_data = generate_random_bidder(i)
    
    # 1. Signup Bidder
    try:
        res = requests.post(f"{AUTH_URL}/signup", json=bidder_data)
        if res.status_code != 200:
            print(f"Failed to signup Bidder {i}. Status: {res.status_code}, Msg: {res.text}")
            continue
        
        token = res.json().get("token")
        
        # 2. Place Bid
        if token:
            headers = {"Authorization": f"Bearer {token}"}
            bid_data = {
                "proposal": f"I am test bidder {i}. Here is my proposal. I have {len(bidder_data['skills'])} skills.",
                "budget": round(random.uniform(100, 2000), 2)
            }
            
            bid_res = requests.post(f"{GIG_URL}/{GIG_ID}/bids", json=bid_data, headers=headers)
            if bid_res.status_code == 200:
                print(f"[{i}/100] Successfully generated Bidder {i} and placed a bid!")
            else:
                print(f"[{i}/100] Bidder {i} signed up, but failed to place bid. Status: {bid_res.status_code}")
                # Maybe Gig isn't open or doesn't exist
                
    except Exception as e:
        print(f"Exception on iteration {i}: {e}")

print("Done generating test data.")
