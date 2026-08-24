# Planetary Ephemeris Verification Receipt v1

**Status:** APPROVED FOR MERCURY–PLUTO LONGITUDE/SIGN PROMOTION ONLY  
**Evidence workflow:** `Planetary Ephemeris Evidence`  
**Run:** `32544861761`  
**Evidence source head:** `f3b42f7b37934340d4339052c507648b41285f3d`  
**Artifact ID:** `9468182741`  
**Artifact:** `planetary-ephemeris-evidence-32544861761`  
**Artifact ZIP SHA-256:** `760636c10f8f089271603f764bb42d3749c5d25bede694b4e4ba64764cebf8fe`  
**Receipt JSON SHA-256:** `6d48b7fdd1c994d5e1e24ec8b30fe745bbd67aad75745f97ee5b5d79de39da77`

## Coordinate contract

Candidate: Astronomy Engine `2.1.19`, geocentric true-ecliptic-of-date longitude at the exact UTC birth timestamp.

Independent reference: NASA/JPL Horizons API, geocentric observer center `500@399`, observer quantity `31`, apparent ecliptic-of-date longitude at the exact same UTC timestamp.

The two paths use distinct engines and sources. A matching zodiac label alone is insufficient; promotion also requires longitude agreement inside the approved tolerance.

## Evidence matrix

The receipt contains **80 comparisons**: 10 timestamps for each of Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto. Fixtures cover golden profiles, seasonal-boundary dates, DST transitions, leap day, a date-line timezone edge, and historical range.

- Total rows: **80**
- Rows per body: **10**
- Zodiac-sign disagreements: **0**
- Maximum observed longitude delta: **0.0033421484949371916°**

| Body | Maximum observed delta |
| --- | ---: |
| Mercury | 0.0014508334155607372° |
| Venus | 0.0006052638971141278° |
| Mars | 0.0010895629015408304° |
| Jupiter | 0.0015015139203029548° |
| Saturn | 0.0030349310078534586° |
| Uranus | 0.0030141932339802224° |
| Neptune | 0.0033421484949371916° |
| Pluto | 0.0006748000997447434° |

## Approved production tolerance

Policy ID: `ASTRO-PLANETARY-LONGITUDE-v1`  
Maximum longitude delta: **0.005°**

The approved tolerance is above the evidence maximum while remaining below one arcminute. Production still fails closed when the independent reference is unavailable, timestamps differ, sources/engines are not independent, zodiac signs disagree, or longitude delta exceeds the tolerance.

## What this receipt authorizes

This receipt authorizes the application to promote **Mercury through Pluto zodiac signs and ecliptic longitudes** only when an individual profile's candidate passes the same independent NASA/JPL comparison under `ASTRO-PLANETARY-LONGITUDE-v1`.

Verified placements may:
- appear in the optional Underlying Systems inspector;
- appear in the elegant natal PDF placement table;
- become eligible as supporting synthesis evidence where the synthesis layer has a distinct, non-repetitive interpretation contract.

## What this receipt does not authorize

It does **not** authorize:
- Midheaven;
- house cusps or planetary house assignments;
- aspects as production claims;
- lunar nodes;
- Chiron;
- astrocartography;
- Human Design;
- deterministic personality conclusions from planetary placements.

Those remain separate evidence lanes. In particular, the legacy linear Chiron approximation and legacy equal-house implementation are not promoted by this receipt.

## Privacy boundary

Major-planet verification runs only through the existing explicit astronomy-verification action. The request contains the already-documented minimal astronomical inputs and does not persist a server profile or invoke AI generation. The returned evidence is reconciled back into the user's existing local profile.
