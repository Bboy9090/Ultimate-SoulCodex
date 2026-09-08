#!/usr/bin/env python3

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from loader import load_all_engines


EXPECTED_CLASSES = {
    "W2_ASTRO_001": "EphemerisEngine",
    "W2_ASTRO_002": "ValidationEngine",
    "W2_ASTRO_003": "PlacidusEngine",
    "W2_ASTRO_004": "WholeSignEngine",
    "W2_ASTRO_005": "AspectsEngine",
    "W2_ASTRO_006": "ExtendedPlanetsEngine",
    "W2_NUMER_001": "NumerologyEngine",
    "W2_HD_001": "HDGateVerifier",
    "W2_CALC_001": "ValidationEngine",
    "W2_CALC_002": "DegradationHarness",
    "W2_CORPUS_001": "CorpusDesigner",
    "W2_CORPUS_002": "SyntheticPopulationGenerator",
}


def verify_engines() -> bool:
    passed = True
    try:
        modules = load_all_engines()
    except Exception as exc:
        print(f"FAIL: loader failed to load engines: {exc}")
        return False

    print("Interface verification")

    for engine_name, class_name in EXPECTED_CLASSES.items():
        module = modules.get(engine_name)
        if module is None:
            print(f"FAIL {engine_name}: module not loaded")
            passed = False
            continue

        cls = getattr(module, class_name, None)

        if cls is None:
            print(f"FAIL {engine_name}: missing {class_name}")
            passed = False
            continue

        engine_id = getattr(cls, "engine_id", None)
        engine_version = getattr(cls, "engine_version", None)

        if not engine_id or not engine_version:
            print(
                f"FAIL {engine_name}: missing engine_id or engine_version"
            )
            passed = False
            continue

        print(
            f"PASS {engine_name}: id={engine_id}, version={engine_version}"
        )

    return passed


def verify_fixtures() -> bool:
    passed = True

    fixtures = [
        ROOT.parent / "fixtures/sample-profile-001.json",
        ROOT.parent / "fixtures/unknown-time.json",
        ROOT.parent / "fixtures/high-latitude.json",
    ]

    print("\nFixture verification")

    for path in fixtures:
        try:
            with path.open("r", encoding="utf-8") as handle:
                data = json.load(handle)

            print(
                f"PASS {path.name}: "
                f"keys={list(data.keys())}"
            )
        except Exception as exc:
            print(
                f"FAIL {path.name}: {exc}"
            )
            passed = False

    return passed


def verify_structure() -> bool:
    passed = True

    track_names = [
        "W2-ASTRO-001",
        "W2-ASTRO-002",
        "W2-ASTRO-003",
        "W2-ASTRO-004",
        "W2-ASTRO-005",
        "W2-ASTRO-006",
        "W2-NUMER-001",
        "W2-HD-001",
        "W2-CALC-001",
        "W2-CALC-002",
        "W2-CORPUS-001",
        "W2-CORPUS-002",
    ]

    print("\nStructure verification")

    for track in track_names:
        track_dir = ROOT / track
        readme = track_dir / "README.md"

        if not track_dir.is_dir():
            print(f"FAIL {track}: directory missing")
            passed = False
            continue

        if not readme.is_file():
            print(f"FAIL {track}: README.md missing")
            passed = False
            continue

        print(f"PASS {track}")

    return passed


def main() -> int:
    checks = [
        verify_structure(),
        verify_engines(),
        verify_fixtures(),
    ]

    print("\nWave 2 push-ready result")

    if all(checks):
        print("PASS — structural baseline verified")
        return 0

    print("FAIL — do not create architecture-lock commit")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
