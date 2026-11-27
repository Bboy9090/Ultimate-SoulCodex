#!/usr/bin/env python3
"""Zero Illusion Engineering Standard (ZIES v1.0) — Mandatory Executable Release Gate.

Exits non-zero if ANY mandatory integrity check fails:
  1. Policy presence (ZERO_ILLUSION_STANDARD.md & REALITY_AUDIT.md).
  2. Static anti-deception scan on desktop_suite/ (prohibits silent except-pass, fabricated demo seeds,
     hardcoded mock hosts, unweighted LUFS fake formulas).
  3. Negative & Known-Answer behavioral verification of platform_exclusive.py (nonexistent file MUST fail,
     SHA-256 MUST match known FIPS 180-4 test vector "abc").
  4. If Sonic_codex ITU-R BS.1770-4 DSP module is present, verifies known-answer 1 kHz sine wave reference
     (-20 dBFS peak -> -23.01 ± 0.15 LUFS) and pure silence -> None (no null-to-zero substitution).
"""

from __future__ import annotations

import hashlib
import math
import re
import struct
import sys
import tempfile
import wave
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parent.parent
SUITE_DIR = REPO_DIR / "desktop_suite"

FORBIDDEN_PATTERNS = [
    (r"DESKTOP-RCHRVGF", "Hardcoded mock endpoint hostname in production UI/code"),
    (r"192\.168\.56\.20", "Hardcoded mock lab IP address in production UI/code"),
    (r"CASE-2026-001", "Pre-seeded demo case record in production backend"),
    (r"Amber Rainstorm", "Pre-seeded demo chapter in production backend"),
    (r"rms_db\s*-\s*0\.69", "Unweighted RMS approximation misrepresented as ITU-R BS.1770 LUFS"),
    (r"except\s+Exception:\s*\n\s*return\s+\[\]", "Silent exception suppression returning empty list"),
    (r"except\s+Exception:\s*\n\s*return\s+\"\"", "Silent exception suppression returning empty string"),
]


def main() -> int:
    failures: list[str] = []

    # 1. Policy & Reality Audit presence
    for req_file in ("ZERO_ILLUSION_STANDARD.md", "REALITY_AUDIT.md"):
        if not (REPO_DIR / req_file).exists():
            failures.append(f"Missing required ZIES deliverable: {req_file}")

    # 2. Static anti-fabrication scan on desktop_suite
    if SUITE_DIR.exists():
        for f in SUITE_DIR.rglob("*"):
            if f.is_file() and f.suffix in (".py", ".html", ".js") and ".pyi_" not in str(f):
                txt = f.read_text(encoding="utf-8", errors="ignore")
                for pat, reason in FORBIDDEN_PATTERNS:
                    if re.search(pat, txt):
                        failures.append(f"ZIES violation in {f.relative_to(REPO_DIR)}: {reason}")

    # 3. Known-Answer & Negative behavioral tests on platform_exclusive.py
    if (SUITE_DIR / "platform_exclusive.py").exists():
        sys.path.insert(0, str(SUITE_DIR))
        import platform_exclusive

        # Negative test: nonexistent file MUST fail truthfully (ok=False)
        neg = platform_exclusive.verify_file_evidence(str(REPO_DIR / "__definitely_missing_zies_probe__.bin"))
        if neg.get("ok") is not False:
            failures.append("Negative test failed: verify_file_evidence did not return ok=False for missing file")

        # Known-answer test: FIPS 180-4 SHA-256("abc")
        expected_abc = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        with tempfile.NamedTemporaryFile(delete=False) as tf:
            tf.write(b"abc")
            tpath = Path(tf.name)
        try:
            got = platform_exclusive.sha256_file(tpath)
            if got != expected_abc:
                failures.append(f"Known-answer SHA-256('abc') mismatch: got {got}, expected {expected_abc}")
        finally:
            tpath.unlink(missing_ok=True)

        # 4. If Sonic_codex ITU-R BS.1770-4 engine is present, run known-answer audio reference vectors
        if (SUITE_DIR / "app_engine.py").exists():
            ae_txt = (SUITE_DIR / "app_engine.py").read_text(encoding="utf-8", errors="ignore")
            if "itu_bs1770_lufs" in ae_txt:
                import app_engine
                sr = 48000
                dur = 2
                # Vector A: 1000 Hz sine wave at -20.0 dBFS peak (amplitude = 0.1 * 32767)
                # ITU-R BS.1770-4 calibration: RMS = -23.0103 dBFS, Stage 1 pre-filter gain at 1 kHz = +0.691 dB,
                # minus 0.691 offset => EXACTLY -23.01 LUFS!
                amp = int(0.1 * 32767)
                samples = [int(amp * math.sin(2 * math.pi * 1000.0 * n / sr)) for n in range(sr * dur)]
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as wf_tmp:
                    wpath = Path(wf_tmp.name)
                try:
                    with wave.open(str(wpath), "wb") as wf:
                        wf.setnchannels(1)
                        wf.setsampwidth(2)
                        wf.setframerate(sr)
                        wf.writeframes(struct.pack(f"<{len(samples)}h", *samples))
                    res = app_engine.analyze_wav(str(wpath))
                    if not res.get("ok"):
                        failures.append(f"ITU-R BS.1770-4 vector A failed: {res}")
                    else:
                        lufs = res.get("lufs_integrated")
                        if lufs is None or abs(lufs - (-23.01)) > 0.15:
                            failures.append(f"ITU-R BS.1770-4 1kHz -20dBFS peak vector out of spec: got {lufs}, expected -23.01 ± 0.15")
                        if abs(res.get("peak_dbfs", 0) - (-20.0)) > 0.1:
                            failures.append(f"Peak dBFS vector mismatch: got {res.get('peak_dbfs')}, expected -20.0")
                finally:
                    wpath.unlink(missing_ok=True)

                # Vector A2 (Metamorphic K-weighting proof): 4000 Hz at same -20 dBFS peak MUST read ~+3.2 to +4.0 LU higher than 1 kHz
                samples_4k = [int(amp * math.sin(2 * math.pi * 4000.0 * n / sr)) for n in range(sr * dur)]
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as wf_4k:
                    wpath_4k = Path(wf_4k.name)
                try:
                    with wave.open(str(wpath_4k), "wb") as wf:
                        wf.setnchannels(1)
                        wf.setsampwidth(2)
                        wf.setframerate(sr)
                        wf.writeframes(struct.pack(f"<{len(samples_4k)}h", *samples_4k))
                    res4k = app_engine.analyze_wav(str(wpath_4k))
                    lufs_4k = res4k.get("lufs_integrated")
                    if lufs_4k is None or not (-20.3 <= lufs_4k <= -19.2):
                        failures.append(f"ITU-R BS.1770-4 4kHz high-shelf K-weighting vector failed: got {lufs_4k}, expected -19.7 ± 0.5")
                finally:
                    wpath_4k.unlink(missing_ok=True)

                # Vector B: Pure digital silence MUST return lufs_integrated=None (never 0.0!)
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as wf_tmp2:
                    wpath2 = Path(wf_tmp2.name)
                try:
                    with wave.open(str(wpath2), "wb") as wf:
                        wf.setnchannels(1)
                        wf.setsampwidth(2)
                        wf.setframerate(sr)
                        wf.writeframes(struct.pack(f"<{sr}h", *([0] * sr)))
                    res2 = app_engine.analyze_wav(str(wpath2))
                    if not res2.get("ok") or res2.get("lufs_integrated") is not None:
                        failures.append(f"Silence vector violated null-to-zero rule: {res2}")
                finally:
                    wpath2.unlink(missing_ok=True)

    if failures:
        print(f"[ZIES GATE FAILED] {REPO_DIR.name} ({len(failures)} violation(s)):")
        for f in failures:
            print("  -", f)
        return 1
    print(f"[ZIES GATE PASSED] {REPO_DIR.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
