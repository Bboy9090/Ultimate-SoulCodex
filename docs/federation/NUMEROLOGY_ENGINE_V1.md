# Canonical Numerology Engine v1

Status: candidate for Federation integration only.

## Method

This engine implements a documented Pythagorean numerology policy. Calculations are deterministic and symbolic; they are not scientific measurements.

- Life Path: calendar-date components reduced under the engine reduction policy.
- Birthday: birth day reduced under the same policy.
- Expression: all normalized A-Z letters in the supplied full name.
- Soul Urge: normalized vowels A, E, I, O, U.
- Personality: normalized consonants.
- Maturity: Life Path plus Expression, reduced under the same policy.
- Master numbers 11, 22, and 33 are preserved when reached by reduction.
- Name normalization removes Unicode diacritics and ignores non-letter punctuation consistently.
- Date-only calculations must be timezone independent and reject impossible calendar dates.

## Release rules

The same inputs and engine version must always produce identical numeric outputs. No random values, inferred names, or fabricated birth data are allowed. Interpretive prose is out of scope for this engine and must be versioned separately.

## Required regression coverage

- timezone-independent date calculations
- 1990-09-17 Life Path regression
- accented-name normalization
- punctuation and compound-name normalization
- master-number preservation
- impossible-date rejection
- repeatability
