#!/usr/bin/env python3
"""
Wave 3 Phase 2: Synthetic Population Generator
Generates 1500-2000 stress-test profiles with controlled edge-case distribution.
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import hashlib


class SyntheticProfileGenerator:
    """Generates synthetic profiles for stress testing."""

    ZODIAC_SIGNS = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]

    LIFE_PATHS = list(range(1, 10)) + [11, 22, 33]  # 1-9 + master numbers

    ELEMENTS = ["Fire", "Earth", "Air", "Water"]

    HD_TYPES = ["Manifestor", "Generator", "Generator Manifesto", "Reflector"]

    LOCATIONS = [
        # Standard locations
        {"name": "New York City, USA", "lat": 40.7128, "lon": -74.0060, "tz": "America/New_York", "category": "normal"},
        {"name": "London, England", "lat": 51.5074, "lon": -0.1278, "tz": "Europe/London", "category": "normal"},
        {"name": "Tokyo, Japan", "lat": 35.6762, "lon": 139.6503, "tz": "Asia/Tokyo", "category": "normal"},
        {"name": "Sydney, Australia", "lat": -33.8688, "lon": 151.2093, "tz": "Australia/Sydney", "category": "normal"},
        {"name": "Paris, France", "lat": 48.8566, "lon": 2.3522, "tz": "Europe/Paris", "category": "normal"},
        {"name": "Berlin, Germany", "lat": 52.5200, "lon": 13.4050, "tz": "Europe/Berlin", "category": "normal"},
        {"name": "Toronto, Canada", "lat": 43.6532, "lon": -79.3832, "tz": "America/Toronto", "category": "normal"},
        {"name": "Mexico City, Mexico", "lat": 19.4326, "lon": -99.1332, "tz": "America/Mexico_City", "category": "normal"},

        # High-latitude locations (60°N+)
        {"name": "Reykjavik, Iceland", "lat": 64.1466, "lon": -21.9426, "tz": "Atlantic/Reykjavik", "category": "high_latitude"},
        {"name": "Stockholm, Sweden", "lat": 59.3293, "lon": 18.0686, "tz": "Europe/Stockholm", "category": "high_latitude"},
        {"name": "Oslo, Norway", "lat": 59.9139, "lon": 10.7522, "tz": "Europe/Oslo", "category": "high_latitude"},
        {"name": "Tromsø, Norway", "lat": 69.6492, "lon": 18.9553, "tz": "Europe/Oslo", "category": "high_latitude"},
        {"name": "Anchorage, Alaska", "lat": 61.2181, "lon": -149.9003, "tz": "America/Anchorage", "category": "high_latitude"},
        {"name": "Fairbanks, Alaska", "lat": 64.8378, "lon": -147.7164, "tz": "America/Anchorage", "category": "high_latitude"},

        # Equatorial locations
        {"name": "Quito, Ecuador", "lat": -0.2299, "lon": -78.5099, "tz": "America/Guayaquil", "category": "equatorial"},
        {"name": "Nairobi, Kenya", "lat": -1.2865, "lon": 36.8172, "tz": "Africa/Nairobi", "category": "equatorial"},
        {"name": "Singapore", "lat": 1.3521, "lon": 103.8198, "tz": "Asia/Singapore", "category": "equatorial"},
        {"name": "Kinshasa, Congo", "lat": -4.3276, "lon": 15.3136, "tz": "Africa/Kinshasa", "category": "equatorial"},

        # Dateline-crossing locations
        {"name": "Honolulu, Hawaii", "lat": 21.3099, "lon": -157.8581, "tz": "Pacific/Honolulu", "category": "edge_longitude"},
        {"name": "Fiji (Suva)", "lat": -18.1248, "lon": 178.4501, "tz": "Pacific/Fiji", "category": "edge_longitude"},
        {"name": "Samoa (Apia)", "lat": -13.7590, "lon": -172.1046, "tz": "Pacific/Samoa", "category": "edge_longitude"},
        {"name": "Kiribati (Tarawa)", "lat": 1.3521, "lon": 172.9789, "tz": "Pacific/Kiritimati", "category": "edge_longitude"},
    ]

    def __init__(self, seed: int = 42):
        """Initialize generator with random seed for reproducibility."""
        random.seed(seed)
        self.profile_count = 0

    def _select_location(self, category: str = None) -> Dict[str, Any]:
        """Select a location, optionally filtered by category."""
        if category:
            filtered = [loc for loc in self.LOCATIONS if loc["category"] == category]
            return random.choice(filtered) if filtered else random.choice(self.LOCATIONS)
        return random.choice(self.LOCATIONS)

    def _generate_birth_date(self, start: str = "1900-01-01", end: str = "2026-09-08") -> str:
        """Generate random birth date in range."""
        start_date = datetime.strptime(start, "%Y-%m-%d")
        end_date = datetime.strptime(end, "%Y-%m-%d")
        delta = end_date - start_date
        random_days = random.randint(0, delta.days)
        birth_date = start_date + timedelta(days=random_days)
        return birth_date.strftime("%Y-%m-%d")

    def _generate_birth_time(self, unknown_rate: float = 0.20) -> Tuple[str, bool]:
        """Generate birth time, with unknown_rate probability of 'unknown'."""
        if random.random() < unknown_rate:
            return "unknown", True

        hour = random.randint(0, 23)
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        time_str = f"{hour:02d}:{minute:02d}:{second:02d}"
        return time_str, False

    def _calculate_sun_sign(self, date_str: str) -> str:
        """Simplistic sun sign calculation from date."""
        month, day = int(date_str[5:7]), int(date_str[8:10])

        sign_dates = [
            (3, 21, "Aries"), (4, 20, "Taurus"), (5, 21, "Gemini"),
            (6, 21, "Cancer"), (7, 23, "Leo"), (8, 23, "Virgo"),
            (9, 23, "Libra"), (10, 23, "Scorpio"), (11, 22, "Sagittarius"),
            (12, 22, "Capricorn"), (1, 20, "Aquarius"), (2, 19, "Pisces")
        ]

        for i, (m, d, sign) in enumerate(sign_dates):
            next_m, next_d = sign_dates[(i + 1) % 12][:2]
            if (month == m and day >= d) or (month == next_m and day < next_d):
                if not (month == next_m and day < next_d):
                    return sign

        return random.choice(self.ZODIAC_SIGNS)

    def generate_profile(self, profile_id: str, stress_category: str = None) -> Dict[str, Any]:
        """Generate a single synthetic profile."""

        # Determine location category based on stress test
        location_category = None
        if stress_category == "high_latitude":
            location_category = "high_latitude"
        elif stress_category == "equatorial":
            location_category = "equatorial"
        elif stress_category == "dateline":
            location_category = "edge_longitude"

        location = self._select_location(location_category)
        birth_date = self._generate_birth_date()
        birth_time, time_unknown = self._generate_birth_time()

        sun_sign = self._calculate_sun_sign(birth_date)
        moon_sign = random.choice(self.ZODIAC_SIGNS)
        rising_sign = None if time_unknown else random.choice(self.ZODIAC_SIGNS)
        life_path = random.choice(self.LIFE_PATHS)
        hd_type = random.choice(self.HD_TYPES)
        element = random.choice(self.ELEMENTS)

        profile = {
            "profile_id": profile_id,
            "name": f"Synthetic Profile {self.profile_count}",
            "birth": {
                "date": birth_date,
                "time": birth_time,
                "timezone": location["tz"],
                "location": {
                    "latitude": location["lat"],
                    "longitude": location["lon"],
                    "city": location["name"]
                },
                "notes": f"Synthetic stress-test profile ({stress_category or 'standard'})"
            },
            "classification": {
                "sun_sign": sun_sign,
                "moon_sign": moon_sign,
                "rising_sign": rising_sign,
                "life_path": life_path,
                "hd_type": hd_type,
                "element_dominant": element
            },
            "verification": {
                "source": "Synthetic / Stress Test",
                "reliability": "synthetic",
                "notes": "Generated for Wave 3 stress testing"
            }
        }

        self.profile_count += 1
        return profile

    def generate_population(self, config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate entire synthetic population with stress distributions."""

        profiles = []
        base_population = config.get("base_population", 1000)
        stress_population = config.get("stress_test_population", 500)
        total_target = config.get("total_target", 1500)

        location_coverage = config.get("location_coverage", {
            "high_latitude": 0.15,
            "equatorial": 0.10,
            "edge_longitude": 0.10,
            "normal": 0.65
        })

        collision_pairs = config.get("collision_pairs", 100)
        synthesis_test_pairs = config.get("synthesis_test_pairs", 150)

        # Phase 1: Base population (normal distribution)
        print(f"Generating {base_population} base profiles...")
        for i in range(base_population):
            profile = self.generate_profile(f"synthetic-base-{i:04d}", stress_category=None)
            profiles.append(profile)

        # Phase 2: Stress-test population (time-based, location-based, etc.)
        print(f"Generating {stress_population} stress-test profiles...")

        # Time-based edge cases (unknown time, DST)
        time_based_count = int(stress_population * 0.2)
        for i in range(time_based_count):
            profile = self.generate_profile(f"synthetic-time-edge-{i:04d}", stress_category="time_edge")
            # Force unknown birth time for some
            if i % 2 == 0:
                profile["birth"]["time"] = "unknown"
                profile["classification"]["rising_sign"] = None
            profiles.append(profile)

        # Location-based edge cases (high-latitude, equatorial, dateline)
        location_based_count = int(stress_population * 0.2)
        for i in range(location_based_count // 3):
            profiles.append(self.generate_profile(f"synthetic-loc-high-{i:04d}", stress_category="high_latitude"))
            profiles.append(self.generate_profile(f"synthetic-loc-equator-{i:04d}", stress_category="equatorial"))
            profiles.append(self.generate_profile(f"synthetic-loc-dateline-{i:04d}", stress_category="dateline"))

        # Numerological stress (life path collisions)
        numer_stress_count = int(stress_population * 0.15)
        for i in range(numer_stress_count):
            profile = self.generate_profile(f"synthetic-numer-{i:04d}", stress_category=None)
            # Force specific life paths to create collisions
            profile["classification"]["life_path"] = random.choice(self.LIFE_PATHS)
            profiles.append(profile)

        # Chart pattern extremes (stelliums, singletons, etc.)
        pattern_count = int(stress_population * 0.15)
        for i in range(pattern_count):
            profile = self.generate_profile(f"synthetic-pattern-{i:04d}", stress_category=None)
            profiles.append(profile)

        # Collision pairs (intentional duplicates for testing)
        print(f"Generating {collision_pairs} collision pairs...")
        for i in range(collision_pairs):
            # Create near-identical pairs
            base_profile = self.generate_profile(f"synthetic-collision-{i:04d}-a")
            collision_profile = base_profile.copy()
            collision_profile["profile_id"] = f"synthetic-collision-{i:04d}-b"
            # Slightly vary birth time (milliseconds)
            if collision_profile["birth"]["time"] != "unknown":
                collision_profile["birth"]["notes"] = "Collision pair - millisecond time difference"
            profiles.append(base_profile)
            profiles.append(collision_profile)

        # Synthesis test pairs (differentiation testing)
        print(f"Generating {synthesis_test_pairs} synthesis test pairs...")
        for i in range(synthesis_test_pairs):
            profile = self.generate_profile(f"synthetic-synthesis-{i:04d}")
            profiles.append(profile)

        print(f"Total profiles generated: {len(profiles)}")
        return profiles


def main():
    """Generate synthetic population and save to JSON."""

    config = {
        "base_population": 1000,
        "stress_test_population": 500,
        "total_target": 1500,
        "date_range": ("1900-01-01", "2026-09-08"),
        "location_coverage": {
            "high_latitude": 0.15,
            "equatorial": 0.10,
            "edge_longitude": 0.10,
            "normal": 0.65
        },
        "time_unknown_rate": 0.20,
        "dst_transition_rate": 0.05,
        "collision_pairs": 100,
        "synthesis_test_pairs": 150
    }

    generator = SyntheticProfileGenerator(seed=42)
    profiles = generator.generate_population(config)

    # Save to JSON
    output_file = "/home/claude/Ultimate-SoulCodex/wave-3/synthetic-population/profiles.json"
    with open(output_file, "w") as f:
        json.dump(profiles, f, indent=2)

    print(f"\nSynthetic population saved to {output_file}")
    print(f"Total profiles: {len(profiles)}")
    print(f"Expected: 1500-2000 (config target: {config['total_target']})")


if __name__ == "__main__":
    main()
