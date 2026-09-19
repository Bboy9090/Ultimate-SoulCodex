import json
import os
from datetime import datetime, timezone

import swisseph as swe

TIMESTAMPS = [
    ("bobby-bronx","1990-09-17T15:11:00Z"),
    ("nyc-dst-spring","2024-03-10T07:30:00Z"),
    ("nyc-dst-fall","2024-11-03T05:30:00Z"),
    ("london-summer","2001-06-21T11:00:00Z"),
    ("london-winter","1985-12-21T23:45:00Z"),
    ("sydney-summer","1999-01-14T19:20:00Z"),
    ("sydney-winter","2010-07-01T08:05:00Z"),
    ("tokyo","1975-04-03T05:32:00Z"),
    ("san-juan","1991-04-23T12:15:00Z"),
    ("cape-town","1968-08-09T20:40:00Z"),
    ("delhi-leap-day","2000-02-29T00:15:00Z"),
    ("kathmandu-quarter-hour-zone","2020-02-29T11:27:00Z"),
    ("adelaide-half-hour-zone","1988-10-28T21:00:00Z"),
    ("honolulu","1944-06-06T13:30:00Z"),
    ("anchorage-high-latitude","2015-09-23T08:15:00Z"),
    ("reykjavik-high-latitude","1950-03-20T13:00:00Z"),
    ("buenos-aires-year-edge","2009-01-01T01:59:00Z"),
    ("nairobi-equatorial","1993-07-26T06:00:00Z"),
    ("apia-date-line","2011-12-31T10:10:00Z"),
    ("kiritimati-utc-plus-14","2026-08-03T09:28:00Z"),
    ("pago-pago-utc-minus-11","2026-08-04T10:28:00Z"),
    ("berlin-1900","1900-01-01T11:00:00Z"),
    ("cairo-1850","1850-05-15T07:24:51Z"),
    ("los-angeles-2100","2100-01-01T05:45:00Z"),
]

ephe_path = os.environ.get("SWISSEPH_EPHE_PATH", ".swisseph")
swe.set_ephe_path(ephe_path)

def julian_day(dt):
    hour = dt.hour + dt.minute / 60 + dt.second / 3600
    return swe.julday(dt.year, dt.month, dt.day, hour, swe.GREG_CAL)

rows = []
for fixture_id, timestamp in TIMESTAMPS:
    dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00")).astimezone(timezone.utc)
    xx, flags = swe.calc_ut(
        julian_day(dt),
        swe.CHIRON,
        swe.FLG_SWIEPH | swe.FLG_SPEED,
    )
    if not (flags & swe.FLG_SWIEPH):
        raise RuntimeError(f"Swiss Ephemeris file-backed Chiron calculation not used for {fixture_id}")
    rows.append({
        "id": fixture_id,
        "inputTimestamp": timestamp,
        "referenceLongitudeDegrees": xx[0] % 360,
        "engine": f"Swiss Ephemeris {swe.version} / pyswisseph",
        "ephemerisFlags": flags,
    })

output = os.environ.get("CHIRON_SWISS_OUTPUT", "chiron-swiss-reference.json")
with open(output, "w", encoding="utf-8") as handle:
    json.dump({
        "schemaVersion": "1.0.0",
        "body": "Chiron",
        "reference": "Swiss Ephemeris SE_CHIRON with seas_18.se1",
        "rows": rows,
    }, handle, indent=2)
    handle.write("\n")

print(json.dumps({"output": output, "rows": len(rows)}, indent=2))
