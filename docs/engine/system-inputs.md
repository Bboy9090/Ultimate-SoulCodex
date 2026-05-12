# System Inputs

Soul Codex inputs should be explicit, normalized, and confidence-aware.

This document defines future-facing input categories only. It does not change current API shapes or database schemas.

## Birth Inputs

Canonical birth inputs:

- Birth date.
- Birth time.
- Birth time known/unknown flag.
- Birth location label.
- Latitude.
- Longitude.
- Timezone.
- Timezone resolution source.
- Calendar/date normalization.

Birth time and location are required for full confidence in ascendant, houses, degree-sensitive placements, and some Human Design details.

## Name Inputs

Numerology may use:

- Full birth name.
- Current name.
- Preferred name.
- Name spelling confidence.
- Name source.

Name-based readings must state which name was used.

## Self-Report Inputs

Self-report makes two users with the same Sun sign different.

Useful self-report categories:

- Stress response.
- Decision style.
- Relationship pattern.
- Boundary pattern.
- Moral compass.
- Current life stage.
- Emotional needs.
- Work style.
- Conflict style.
- Spiritual orientation.

## Family And Context Inputs

Family/context inputs may include:

- Parent/caregiver signs or charts.
- Parent/caregiver numerology.
- Parent/caregiver Human Design data.
- Caregiver behavior patterns.
- Family structure.
- Emotional climate.
- Environment and neighborhood context.
- Cultural or spiritual background.
- Repeating family expectations.

These inputs are always shaping context, not destiny.

## Input Metadata

Every input should eventually carry:

```txt
source:
provided_by:
collected_at:
normalized_value:
confidence:
missing_or_estimated_fields:
```

## Missing Input Behavior

When input data is missing:

- Do not invent it.
- Omit unsupported outputs.
- Lower confidence where appropriate.
- Explain what is missing.
- Continue generating useful guidance from available signals.
