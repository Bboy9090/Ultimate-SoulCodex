# Content Rating Questionnaire — Soul Codex

Filed via the IARC questionnaire in Play Console.
Expected outcome: **Everyone** (PEGI 3 / ESRB E / USK 0 / ACB G).

## Category
Reference, Education, & Lifestyle

## Answers

| Question | Answer |
|---|---|
| Does the app contain violence? | No |
| Sexual content or nudity? | No |
| Profanity or crude humor? | No |
| Controlled substances (drugs, alcohol, tobacco)? | No |
| Gambling or simulated gambling? | No |
| User-generated content shared with other users? | No (journal entries are private to the user) |
| User-to-user communication? | No |
| Shares user location with other users? | No |
| Allows digital purchases? | Yes (premium subscription via Google Play Billing) |

## Notes for reviewers

Soul Codex is a personality / lifestyle app. The "AI Soul Guide" feature
generates first-person reflective text based on the user's profile and is
moderated by guardrails in the prompt layer (see `blandnessFilter.ts` and
the system prompts in `routes/chat.ts`). It cannot be used to generate
arbitrary content or messages to other users.

Astrology, numerology, and similar systems are presented as reflective
tools, not as predictive or medical advice. There is no occult ritual,
divination wagering, or paid fortune-telling element.
