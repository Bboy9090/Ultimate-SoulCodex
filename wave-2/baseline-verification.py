#!/usr/bin/env python3
"""
Wave 2 Baseline Verification - Post Wave 1 Foundation
Verifies that Wave 2 has all required Wave 1 specs and foundational infrastructure
"""

import json
import os
from pathlib import Path

def verify_wave1_specs():
    """Verify all 7 Wave 1 specs exist and are valid JSON"""
    required_specs = [
        "W1-ZODIAC-SIGNS.json",
        "W1-ASPECTS-ORBS.json",
        "W1-HOUSE-SYSTEMS.json",
        "W1-LIFE-PATH-NUMBERS.json",
        "W1-PLANETS-LUMINARIES.json",
        "W1-LUNAR-NODES.json",
        "W1-EPHEMERIS-TECHNICAL.json"
    ]

    specs_path = Path("soul-codex-federation/specs")
    results = {"found": [], "missing": []}

    for spec in required_specs:
        spec_file = specs_path / spec
        if spec_file.exists():
            try:
                with open(spec_file, 'r') as f:
                    data = json.load(f)
                    results["found"].append({
                        "spec": spec,
                        "size_kb": spec_file.stat().st_size / 1024,
                        "spec_id": data.get("spec_id", "unknown"),
                        "version": data.get("version", "unknown")
                    })
            except Exception as e:
                results["missing"].append({"spec": spec, "error": str(e)})
        else:
            results["missing"].append({"spec": spec, "error": "File not found"})

    return results

def verify_wave2_structure():
    """Verify Wave 2 directory structure"""
    wave2_path = Path("wave-2")
    required_dirs = ["engines", "tracks", "integration"]

    structure = {}
    if wave2_path.exists():
        structure["exists"] = True
        structure["directories"] = {}
        for dir_name in required_dirs:
            dir_path = wave2_path / dir_name
            structure["directories"][dir_name] = {
                "exists": dir_path.exists(),
                "files": len(list(dir_path.glob("*"))) if dir_path.exists() else 0
            }
    else:
        structure["exists"] = False

    return structure

def verify_wave3_completion():
    """Verify Wave 3 completion artifacts exist"""
    wave3_path = Path("wave-3")
    artifacts = {
        "corpus": wave3_path / "golden-corpus" / "profiles.json",
        "synthetic": wave3_path / "synthetic-population" / "profiles.json",
        "calculations": wave3_path / "synthesis-engine" / "calculations" / "all_profiles_calculations.json",
        "evidence_ledger": wave3_path / "evidence-ledger" / "all_profiles_evidence_ledger.json",
        "audit_report": wave3_path / "quality-gates-audit-report.json"
    }

    results = {}
    for name, path in artifacts.items():
        if path.exists():
            size_mb = path.stat().st_size / (1024 * 1024)
            results[name] = {"exists": True, "size_mb": round(size_mb, 2)}
        else:
            results[name] = {"exists": False}

    return results

def verify_git_status():
    """Verify git status is clean or only has expected changes"""
    import subprocess

    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True,
            text=True,
            timeout=5
        )
        uncommitted = [line for line in result.stdout.strip().split('\n') if line]
        return {
            "clean": len(uncommitted) == 0,
            "uncommitted_count": len(uncommitted),
            "uncommitted": uncommitted[:10]  # Show first 10
        }
    except Exception as e:
        return {"error": str(e)}

def main():
    """Run all verifications and produce report"""
    print("\n" + "="*70)
    print("WAVE 2 BASELINE VERIFICATION REPORT")
    print("="*70 + "\n")

    # Wave 1 Specs
    print("1. WAVE 1 SPECIFICATIONS CHECK")
    print("-" * 70)
    w1_results = verify_wave1_specs()
    print(f"   ✓ Found: {len(w1_results['found'])} specs")
    for spec in w1_results["found"]:
        print(f"     - {spec['spec']} ({spec['size_kb']:.1f} KB) [{spec['spec_id']}]")
    if w1_results["missing"]:
        print(f"   ✗ Missing: {len(w1_results['missing'])} specs")
        for spec in w1_results["missing"]:
            print(f"     - {spec['spec']}: {spec['error']}")
    print()

    # Wave 2 Structure
    print("2. WAVE 2 INFRASTRUCTURE CHECK")
    print("-" * 70)
    w2_results = verify_wave2_structure()
    if w2_results.get("exists"):
        print("   ✓ Wave 2 directory exists")
        for dir_name, info in w2_results["directories"].items():
            status = "✓" if info["exists"] else "✗"
            print(f"     {status} {dir_name}: {info['files']} files")
    else:
        print("   ✗ Wave 2 directory not found")
    print()

    # Wave 3 Completion
    print("3. WAVE 3 DELIVERABLES CHECK")
    print("-" * 70)
    w3_results = verify_wave3_completion()
    for artifact, info in w3_results.items():
        if info["exists"]:
            print(f"   ✓ {artifact}: {info['size_mb']} MB")
        else:
            print(f"   ✗ {artifact}: NOT FOUND")
    print()

    # Git Status
    print("4. GIT REPOSITORY STATUS")
    print("-" * 70)
    git_results = verify_git_status()
    if git_results.get("error"):
        print(f"   ✗ Error checking git: {git_results['error']}")
    else:
        if git_results["clean"]:
            print("   ✓ Git repository is clean")
        else:
            print(f"   ⚠ {git_results['uncommitted_count']} uncommitted changes:")
            for line in git_results["uncommitted"][:5]:
                print(f"     {line}")
    print()

    # Summary
    print("="*70)
    w1_pass = len(w1_results["found"]) == 7 and len(w1_results["missing"]) == 0
    w2_pass = w2_results.get("exists", False)
    w3_pass = all(info["exists"] for info in w3_results.values())
    git_pass = git_results.get("clean", False) or git_results.get("uncommitted_count", 0) == 0

    status_lines = [
        ("Wave 1 Specs", w1_pass),
        ("Wave 2 Infrastructure", w2_pass),
        ("Wave 3 Deliverables", w3_pass),
        ("Git Status", git_pass)
    ]

    all_pass = all(status for _, status in status_lines)

    for check, status in status_lines:
        symbol = "✓ PASS" if status else "✗ FAIL"
        print(f"{symbol}: {check}")

    print("="*70)
    if all_pass:
        print("\n✓ WAVE 2 BASELINE VERIFIED - Ready for promotion\n")
        return 0
    else:
        print("\n✗ WAVE 2 BASELINE INCOMPLETE - Address failures above\n")
        return 1

if __name__ == "__main__":
    exit(main())
