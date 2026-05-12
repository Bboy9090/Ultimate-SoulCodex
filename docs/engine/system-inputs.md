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
- required: birth date
- precision-critical: birth time, location, timezone
- impact when missing: reduced or unverified rising/house precision

Human Design:
- required baseline: birth date
- precision-critical: birth time and location/timezone
- impact when missing: degraded authority/profile/channel precision

Numerology:
- required: birth date
- optional: name for expanded numerology layers
- impact when missing: life-path or derived numerology fields may be unavailable

Behavioral and context layer:
- optional: mirror answers, user reflections, parent-family context
- impact when missing: less personalized pattern differentiation

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
