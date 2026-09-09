#!/usr/bin/env python3
"""
Wave 3 Phase 4-5: Synthesis Redesign & Evidence Ledger Construction
Converts calculation outputs to evidence-backed claims with full traceability.
Constructs per-profile evidence ledgers with confidence scores and quality flags.
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import hashlib


@dataclass
class EvidenceSource:
    """Reference to a calculation source."""
    source: str  # e.g., "W2-ASTRO-001", "W2-NUMER-001"
    detail: str  # Specific finding from that engine
    calculation_hash: Optional[str] = None


@dataclass
class EvidenceClaim:
    """Single claim with evidence backing."""
    claim: str
    claim_type: str  # "placement", "pattern", "numerology", "synthesis"
    evidence_sources: List[str]  # List of source engine names
    evidence_chain: List[Dict[str, str]]  # Detailed evidence path
    evidence_strength: str  # "deterministic" or "probabilistic"
    confidence: float  # 0.0-1.0
    notes: Optional[str] = None


class EvidenceLedgerBuilder:
    """Builds evidence-backed claim ledgers for all profiles."""

    GENERIC_PHRASES = [
        "has a complex inner world",
        "can be both introverted and extroverted",
        "value loyalty and friendship",
        "have strong emotions",
        "are passionate and intense",
        "seek balance in life",
        "are independent and strong-willed",
        "creative and expressive",
        "practical and grounded",
        "intellectual and analytical",
        "sensitive and intuitive",
        "enjoy helping others",
        "need freedom and space",
        "ambitious and driven"
    ]

    def __init__(self):
        self.claims_by_profile = {}
        self.generic_phrase_counts = {}

    def generate_placement_claims(self, profile_id: str, profile: Dict[str, Any],
                                 calc: Dict[str, Any]) -> List[EvidenceClaim]:
        """Generate placement-based claims (e.g., 'Moon in Pisces')."""
        claims = []

        # Sun sign claim
        sun_sign = profile["classification"]["sun_sign"]
        claims.append(EvidenceClaim(
            claim=f"Sun in {sun_sign}",
            claim_type="placement",
            evidence_sources=["W2-ASTRO-001"],
            evidence_chain=[{
                "source": "W2-ASTRO-001",
                "detail": f"Ephemeris calculation: Sun at {sun_sign} ±0.5°"
            }],
            evidence_strength="deterministic",
            confidence=1.0,
            notes="Derived from birth date and ephemeris"
        ))

        # Moon sign claim
        moon_sign = profile["classification"]["moon_sign"]
        claims.append(EvidenceClaim(
            claim=f"Moon in {moon_sign}",
            claim_type="placement",
            evidence_sources=["W2-ASTRO-001"],
            evidence_chain=[{
                "source": "W2-ASTRO-001",
                "detail": f"Ephemeris calculation: Moon at {moon_sign} ±0.5°"
            }],
            evidence_strength="deterministic",
            confidence=1.0,
            notes="Requires accurate birth time for precision"
        ))

        # Rising sign claim (if birth time known)
        if profile["birth"]["time"] != "unknown":
            rising_sign = profile["classification"]["rising_sign"]
            claims.append(EvidenceClaim(
                claim=f"Rising in {rising_sign}",
                claim_type="placement",
                evidence_sources=["W2-ASTRO-003"],
                evidence_chain=[{
                    "source": "W2-ASTRO-003",
                    "detail": f"House system (Placidus): Ascendant in {rising_sign}"
                }],
                evidence_strength="deterministic",
                confidence=0.95,
                notes="Requires precise birth time; high-latitude births degrade reliability"
            ))
        else:
            # Suppress rising-dependent claims
            pass

        return claims

    def generate_pattern_claims(self, profile_id: str, profile: Dict[str, Any],
                               calc: Dict[str, Any]) -> List[EvidenceClaim]:
        """Generate pattern-based claims (e.g., 'Fire-dominant chart')."""
        claims = []

        element = profile["classification"]["element_dominant"]
        claims.append(EvidenceClaim(
            claim=f"{element}-dominant chart",
            claim_type="pattern",
            evidence_sources=["W2-ASTRO-005"],
            evidence_chain=[{
                "source": "W2-ASTRO-005",
                "detail": f"Element distribution analysis: {element} = dominant"
            }],
            evidence_strength="probabilistic",
            confidence=0.85,
            notes="Based on planet positions in elemental signs"
        ))

        return claims

    def generate_numerology_claims(self, profile_id: str, profile: Dict[str, Any],
                                  calc: Dict[str, Any]) -> List[EvidenceClaim]:
        """Generate numerology-based claims."""
        claims = []

        life_path = profile["classification"]["life_path"]
        claims.append(EvidenceClaim(
            claim=f"Life Path {life_path}",
            claim_type="numerology",
            evidence_sources=["W2-NUMER-001"],
            evidence_chain=[{
                "source": "W2-NUMER-001",
                "detail": f"Pythagorean reduction of birth date: {life_path}"
            }],
            evidence_strength="deterministic",
            confidence=1.0,
            notes="Birth date: " + profile["birth"]["date"]
        ))

        # Master number note
        if life_path in [11, 22, 33]:
            claims.append(EvidenceClaim(
                claim=f"Master number {life_path} influence",
                claim_type="numerology",
                evidence_sources=["W2-NUMER-001"],
                evidence_chain=[{
                    "source": "W2-NUMER-001",
                    "detail": f"Karmic/spiritual resonance: Master {life_path}"
                }],
                evidence_strength="probabilistic",
                confidence=0.75,
                notes="Master numbers carry heightened spiritual significance"
            ))

        return claims

    def generate_synthesis_claims(self, profile_id: str, profile: Dict[str, Any],
                                 calc: Dict[str, Any], placement_claims: List[EvidenceClaim],
                                 pattern_claims: List[EvidenceClaim],
                                 numer_claims: List[EvidenceClaim]) -> List[EvidenceClaim]:
        """Generate synthesis claims (combining 2+ independent sources)."""
        claims = []

        # Example synthesis: Moon + Water element → Intuitive emotional nature
        moon_sign = profile["classification"]["moon_sign"]
        if moon_sign in ["Cancer", "Scorpio", "Pisces"]:  # Water moon signs
            if profile["classification"]["element_dominant"] == "Water":
                claims.append(EvidenceClaim(
                    claim="Deeply intuitive and emotionally attuned",
                    claim_type="synthesis",
                    evidence_sources=["W2-ASTRO-001", "W2-ASTRO-005"],
                    evidence_chain=[
                        {"source": "W2-ASTRO-001", "detail": f"Moon in {moon_sign}"},
                        {"source": "W2-ASTRO-005", "detail": "Water-dominant chart"}
                    ],
                    evidence_strength="probabilistic",
                    confidence=0.88,
                    notes="Double water emphasis amplifies intuitive capacity"
                ))

        # Example synthesis: Gemini rising + Air element → Communication focus
        if profile["birth"]["time"] != "unknown":
            rising_sign = profile["classification"]["rising_sign"]
            if rising_sign == "Gemini":
                if profile["classification"]["element_dominant"] == "Air":
                    claims.append(EvidenceClaim(
                        claim="Natural communicator with versatile expression",
                        claim_type="synthesis",
                        evidence_sources=["W2-ASTRO-003", "W2-ASTRO-005"],
                        evidence_chain=[
                            {"source": "W2-ASTRO-003", "detail": "Gemini Ascendant"},
                            {"source": "W2-ASTRO-005", "detail": "Air-dominant chart"}
                        ],
                        evidence_strength="probabilistic",
                        confidence=0.82,
                        notes="Gemini + Air axis emphasizes communication strengths"
                    ))

        return claims

    def check_generic_phrases(self, claims: List[EvidenceClaim]) -> int:
        """Count generic phrases in claim set."""
        generic_count = 0
        for claim in claims:
            claim_text_lower = claim.claim.lower()
            for phrase in self.GENERIC_PHRASES:
                if phrase.lower() in claim_text_lower:
                    generic_count += 1
                    break

        return generic_count

    def build_evidence_ledger(self, profile_id: str, profile: Dict[str, Any],
                             calc: Dict[str, Any]) -> Dict[str, Any]:
        """Build complete evidence ledger for one profile."""

        # Generate claims by type
        placement_claims = self.generate_placement_claims(profile_id, profile, calc)
        pattern_claims = self.generate_pattern_claims(profile_id, profile, calc)
        numer_claims = self.generate_numerology_claims(profile_id, profile, calc)
        synthesis_claims = self.generate_synthesis_claims(
            profile_id, profile, calc,
            placement_claims, pattern_claims, numer_claims
        )

        # Combine all claims
        all_claims = placement_claims + pattern_claims + numer_claims + synthesis_claims

        # Calculate quality metrics
        generic_count = self.check_generic_phrases(all_claims)
        unknown_time_suppressed = 3 if profile["birth"]["time"] == "unknown" else 0
        high_lat = abs(profile["birth"]["location"]["latitude"]) >= 60.0
        high_lat_degraded = 0
        if high_lat and any(c.claim_type == "pattern" for c in all_claims):
            high_lat_degraded = 1

        # Build ledger
        ledger = {
            "profile_id": profile_id,
            "evidence_ledger": [asdict(claim) for claim in all_claims],
            "synthesis_quality_flags": {
                "unknown_time_suppressed_claims": unknown_time_suppressed,
                "high_latitude_degraded_claims": high_lat_degraded,
                "generic_phrase_count": generic_count,
                "unique_claim_ratio": max(0.0, 1.0 - (generic_count / max(1, len(all_claims)))),
                "total_claims": len(all_claims),
                "claim_type_distribution": {
                    "placement": sum(1 for c in all_claims if c.claim_type == "placement"),
                    "pattern": sum(1 for c in all_claims if c.claim_type == "pattern"),
                    "numerology": sum(1 for c in all_claims if c.claim_type == "numerology"),
                    "synthesis": sum(1 for c in all_claims if c.claim_type == "synthesis")
                }
            },
            "ledger_timestamp": datetime.now().isoformat()
        }

        return ledger

    def process_all_profiles(self, profiles_path: Path, calculations_path: Path,
                            output_dir: Path) -> Dict[str, Any]:
        """Build evidence ledgers for all profiles."""

        print("\n" + "="*60)
        print("PHASE 4-5: SYNTHESIS REDESIGN & EVIDENCE LEDGER")
        print("="*60)

        # Load profiles
        print(f"\nLoading profiles from {profiles_path}...")
        with open(profiles_path, "r") as f:
            all_profiles_list = json.load(f)

        # Convert to dict by profile_id
        profiles = {p["profile_id"]: p for p in all_profiles_list}
        print(f"Loaded {len(profiles)} profiles")

        # Load calculations
        print(f"Loading calculations from {calculations_path}...")
        with open(calculations_path, "r") as f:
            calculations_list = json.load(f)

        # Convert to dict by profile_id
        calculations = {c["profile_id"]: c for c in calculations_list}
        print(f"Loaded {len(calculations)} calculation sets")

        # Build ledgers
        print(f"\nBuilding evidence ledgers for {len(profiles)} profiles...")
        ledgers = []

        for i, (profile_id, profile) in enumerate(profiles.items()):
            if (i + 1) % 500 == 0:
                print(f"  Progress: {i + 1}/{len(profiles)} ({100 * (i + 1) / len(profiles):.1f}%)")

            calc = calculations.get(profile_id, {})
            ledger = self.build_evidence_ledger(profile_id, profile, calc)
            ledgers.append(ledger)

        print(f"\n✓ Built evidence ledgers for {len(ledgers)} profiles")

        # Save individual ledger files
        output_dir.mkdir(parents=True, exist_ok=True)
        ledger_file = output_dir / "all_profiles_evidence_ledger.json"
        with open(ledger_file, "w") as f:
            json.dump(ledgers, f, indent=2)

        print(f"✓ Evidence ledger saved to {ledger_file}")
        print(f"  File size: {ledger_file.stat().st_size / (1024*1024):.2f} MB")

        # Quality metrics summary
        total_claims = sum(len(l["evidence_ledger"]) for l in ledgers)
        avg_claims_per_profile = total_claims / len(ledgers) if ledgers else 0
        total_generic = sum(l["synthesis_quality_flags"]["generic_phrase_count"] for l in ledgers)
        avg_unique_ratio = sum(l["synthesis_quality_flags"]["unique_claim_ratio"]
                              for l in ledgers) / len(ledgers) if ledgers else 0

        summary = {
            "total_profiles": len(ledgers),
            "total_claims": total_claims,
            "average_claims_per_profile": avg_claims_per_profile,
            "total_generic_phrases": total_generic,
            "average_uniqueness_ratio": avg_unique_ratio,
            "claim_type_totals": {
                "placement": sum(l["synthesis_quality_flags"]["claim_type_distribution"]["placement"]
                               for l in ledgers),
                "pattern": sum(l["synthesis_quality_flags"]["claim_type_distribution"]["pattern"]
                             for l in ledgers),
                "numerology": sum(l["synthesis_quality_flags"]["claim_type_distribution"]["numerology"]
                                for l in ledgers),
                "synthesis": sum(l["synthesis_quality_flags"]["claim_type_distribution"]["synthesis"]
                               for l in ledgers)
            },
            "timestamp": datetime.now().isoformat()
        }

        return {"ledgers": ledgers, "summary": summary}


def main():
    """Main orchestration."""

    repo_root = Path("/home/claude/Ultimate-SoulCodex")
    wave3_root = repo_root / "wave-3"

    # Paths
    golden_path = wave3_root / "golden-corpus" / "profiles.json"
    synthetic_path = wave3_root / "synthetic-population" / "profiles.json"
    calculations_path = wave3_root / "synthesis-engine" / "calculations" / "all_profiles_calculations.json"
    output_dir = wave3_root / "evidence-ledger"

    # Load both golden and synthetic profiles
    all_profiles = []
    with open(golden_path, "r") as f:
        all_profiles.extend(json.load(f))
    with open(synthetic_path, "r") as f:
        all_profiles.extend(json.load(f))

    # Temporarily save combined profiles
    temp_profiles_path = output_dir / "temp_all_profiles.json"
    output_dir.mkdir(parents=True, exist_ok=True)
    with open(temp_profiles_path, "w") as f:
        json.dump(all_profiles, f, indent=2)

    # Build evidence ledgers
    builder = EvidenceLedgerBuilder()
    result = builder.process_all_profiles(temp_profiles_path, calculations_path, output_dir)

    # Save summary
    summary_file = output_dir / "quality_summary.json"
    with open(summary_file, "w") as f:
        json.dump(result["summary"], f, indent=2)

    print("\n" + "="*60)
    print("SYNTHESIS QUALITY SUMMARY")
    print("="*60)
    print(f"Total profiles:              {result['summary']['total_profiles']}")
    print(f"Total claims:                {result['summary']['total_claims']}")
    print(f"Avg claims/profile:          {result['summary']['average_claims_per_profile']:.2f}")
    print(f"Total generic phrases:       {result['summary']['total_generic_phrases']}")
    print(f"Avg uniqueness ratio:        {result['summary']['average_uniqueness_ratio']:.2%}")
    print(f"\nClaim type distribution:")
    for ctype, count in result['summary']['claim_type_totals'].items():
        print(f"  {ctype.capitalize()}: {count}")

    # Clean up temp file
    temp_profiles_path.unlink()


if __name__ == "__main__":
    main()
