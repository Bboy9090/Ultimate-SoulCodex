"""
Ultimate Soul Codex - Engine of the Eternal Now
Backend - FastAPI
Merged version with unique generation system
Repository: https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional
import os
from .services.archetype_generator import ArchetypeGenerator

app = FastAPI(
    title="Ultimate Soul Codex - Engine of the Eternal Now",
    version="1.0.0",
    description="Unveil your cosmic blueprint through 30+ mystical systems",
    repository="https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize generator
archetype_generator = ArchetypeGenerator()

class BirthData(BaseModel):
    date: str
    time: str
    location: str
    timezone: Optional[str] = None

class ArchetypeRequest(BaseModel):
    birth_data: BirthData
    user_id: str
    all_systems: Optional[Dict] = None

@app.get("/")
async def root():
    return {
        "status": "Ultimate Soul Codex - Engine of the Eternal Now",
        "version": "1.0.0",
        "repository": "https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now",
        "message": "Merged version: Render's clean layout + Replit's legendary polish"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/soul-archetype")
async def generate_archetype(request: ArchetypeRequest):
    """
    Generate unique soul archetype.
    Ensures "Who I Am" is never duplicated.
    """
    try:
        # Generate unique archetype
        archetype = archetype_generator.generate_unique_archetype(
            birth_data=request.birth_data.dict(),
            user_id=request.user_id,
            all_systems=request.all_systems or {}
        )
        
        return archetype
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating archetype: {str(e)}")

@app.get("/api/systems")
async def get_systems():
    """Get list of all 30+ mystical systems"""
    return {
        "systems": [
            "Western Astrology",
            "Vedic Astrology",
            "Human Design",
            "Gene Keys",
            "Numerology",
            "Enneagram",
            "MBTI",
            "Chinese BaZi",
            "Mayan System",
            "Kabbalah",
            "Tarot Birth Cards",
            "I Ching",
            "Chakra System",
            "Sacred Geometry",
            "Runes",
            "Fixed Stars",
            "Arabic Parts",
            "Asteroids",
            "Ayurveda",
            # ... more systems
        ]
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
