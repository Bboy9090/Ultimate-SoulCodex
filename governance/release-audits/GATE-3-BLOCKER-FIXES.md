# Gate 3 Blocker Fixes

Required before Foundation release:

1. Backend must return unresolved verification states instead of approximate Sun, Moon, Rising, planet, house, or aspect data.
2. PosterPage must remove fabricated Gemini/Pisces fallbacks and render explicit unavailable/pending states.
3. Onboarding must stop promoting date-boundary Sun estimates into authoritative profile data, compatibility warmups, or horoscope requests.
4. Focused regression tests must prove unresolved values cannot be silently upgraded.
5. Gate 3 must be re-audited with zero silent upgrades.

Full original guide is preserved at commit `67c73b25022f77e9c62dde2c5db5c9968e7f38ac`.
