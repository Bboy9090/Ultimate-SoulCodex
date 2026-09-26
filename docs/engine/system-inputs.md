# System Inputs Contract

## Purpose

Define required and optional inputs by system and how missing data affects confidence and output scope.

## Core Identity Inputs

Required minimum:
- name (for some narrative and numerology pathways)
- birth date

Precision inputs:
- birth time
- birth location
- timezone or reliable timezone derivation

## Inputs by System

Astrology:
- required minimum: birth date
- exact timed chart requires: valid birth time, IANA timezone, and coordinates for horizon geometry
- impact when missing: date-only Sun may be resolved only when the sign is stable across the relevant local civil day; Moon, Rising, houses, and other exact-time placements remain unresolved rather than approximated

Human Design:
- required for governed core: valid birth date, exact birth time, resolvable timezone, and coordinates
- impact when missing or civil time is ambiguous/nonexistent: Human Design remains unresolved; Type, Strategy, Authority, Profile, centers, channels, and gates are not partially invented or degraded into a substitute chart

Numerology:
- birth date required for date-derived fields such as Life Path, Birthday, and current cycles
- normalized name required for name-derived fields such as Expression, Soul Urge, Personality, and Maturity
- impact when missing: only fields justified by the available input are calculated; missing name components remain unresolved

Behavioral and context layer:
- optional: explicit mirror/assessment answers, user reflections, parent-family context
- impact when missing: supporting reflection is thinner
- boundary: these inputs do not silently rewrite the stable birth-derived Codex fingerprint

## Context Input Taxonomy

- personal birth inputs
- computed system outputs
- self-report behavior inputs
- family and environment context
- confidence metadata

## Input Integrity Rules

- Unknown values must be explicit, not inferred silently.
- Approximate values must be marked as approximate.
- Missing precision must flow into confidence and copy disclosures.
