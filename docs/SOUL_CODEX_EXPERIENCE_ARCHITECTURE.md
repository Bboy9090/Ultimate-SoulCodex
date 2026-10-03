# Soul Codex Experience Architecture

## Product rule

Complex machinery, clean surface.

Soul Codex does not lead with a catalog of systems. It answers four questions:

1. Tell me about me.
2. Tell me about today.
3. Tell me about me and this person.
4. Explain why.

The product may use astrology, numerology, Human Design, behavioral self-report, and governed evidence internally, but the interface must synthesize those systems into readable answers before exposing technical detail.

## Surface 1 — Me

Lead with a compact personal synthesis.

Primary order:
- Big 3: Sun, Moon, Rising.
- Core Numbers: Life Path, Expression, Soul Urge.
- Human Design: Type, Strategy, Authority, Profile when verified.
- One cross-system synthesis.
- One contradiction or tension when supported.
- One Diamond Way next move.

Progressive disclosure:
- summary card;
- tap for exact placement/calculation;
- tap again for provenance and limitations.

Unknown information stays unresolved. Birth-time-dependent placements do not receive guesses.

## Surface 2 — Today

The daily experience is the habit loop.

Show:
- one Daily Synthesis;
- three to five strongest current influences;
- current astrological transits when verified;
- numerology timing;
- Human Design context when verified;
- one explicit next move.

Do not produce deterministic forecasts.

Every daily item must make clear whether it is:
- astronomical/deterministic data;
- symbolic interpretation;
- user-confirmed lived evidence;
- unresolved.

## Surface 3 — Connections

Do not lead with one compatibility percentage.

Primary dimensions:
- Communication
- Emotional rhythm
- Attraction and chemistry
- Life direction
- Human Design context when both profiles are verified

Each dimension must explain the actual supporting comparison and preserve uncertainty.

## Surface 4 — Why

Every important insight needs a visible route to provenance.

Why must answer:
- What was calculated?
- What was independently verified?
- What is deterministic math?
- What is symbolic interpretation?
- What came from the user's answers?
- What is missing or unresolved?

Evidence detail is available on demand. It must not dominate the default reading.

## Epistemic language

Verified data may be stated directly:
- "Your calculated Life Path is 9."
- "Your verified Moon is in Virgo."

Interpretive meaning must remain interpretive:
- "Virgo symbolism emphasizes..."
- "Life Path 9 symbolism is commonly associated with..."

Behavioral claims require behavioral evidence:
- "Your answers show..."
- "You reported..."

Never promote verified math into verified psychology.

## Diamond Way closure

Every substantive reading ends with:

### Clarity
One plain-language sentence naming what matters most.

### Depth
The smallest sufficient explanation of the systems or evidence supporting the insight.

### Next move
One specific action, experiment, boundary, question, or conversation.

No reading ends on abstract theory alone.

## Information budget

Default screen:
- one primary insight;
- three to five supporting signals;
- one next move.

Technical detail belongs behind progressive disclosure.

A sentence that adds information without adding understanding should be removed from the primary surface.

## Competitive posture

Soul Codex should match the readability and habit-forming simplicity of leading astrology apps without copying their voice or restricting itself to astrology.

The advantage is not "more systems."

The advantage is:
- broader evidence;
- cleaner synthesis;
- transparent provenance;
- contradiction-aware interpretation;
- behavior-aware personalization;
- actionable closure.


## Monetization architecture

Monetization must preserve trust and product clarity.

The free layer should answer the user's four core questions at a useful baseline. Paid access should unlock greater depth, continuity, richer cross-system synthesis, and advanced relationship/timing intelligence.

### Free — Core Clarity

Free users receive:

- one active personal profile;
- verified or range-stable Big 3 where evidence supports them;
- basic Sun, Moon, Rising interpretations;
- Life Path and date-only numerology;
- a limited Daily synthesis using eligible qualified systems;
- up to three current influences;
- basic Connections with saved people;
- one bounded compatibility view using supported shared evidence;
- evidence status and "Why am I seeing this?" provenance;
- Diamond Way Clarity / Depth / Next Move closure;
- unknown-data fail-closed behavior;
- basic profile sharing.

Free must remain useful enough to establish trust. Do not deliberately degrade calculation accuracy for free users.

### Paid — Soul Codex+

The current paid promise includes only capabilities marked live in the central product-access registry:

- full governed numerology including Expression, Soul Urge, Personality, and Maturity when a complete birth name is available;
- verified Human Design Type, Strategy, Authority, and Profile;
- richer Daily synthesis with up to five qualified current influences;
- the evidence-aware downloadable natal PDF report.

These capabilities must have an end-to-end implementation path, entitlement gate, and regression coverage before they appear as included paid value.

### Paid roadmap — not sold yet

The following remain planned and must not be advertised as included in current Soul Codex+ until their complete product paths are qualified:

- full natal chart premium surface with all qualified planets, houses, aspects, Midheaven, Nodes, and Chiron;
- Human Design centers, channels, and deeper interaction synthesis;
- advanced transit interpretation;
- Timeline history;
- five-dimension multi-system Connections;
- deeper cross-system synthesis;
- premium personalized tarot/card generation.

A planned capability is unavailable to both Free and Plus users until its registry state changes from `planned` to `live`.

### Paywall rule

The paywall should appear at the moment the user asks for more depth, not before the free answer is useful.

Good paywall moments:
- "See all five influences"
- "Open full natal chart"
- "Compare emotional rhythm"
- "Add Human Design context"
- "See the deeper relationship breakdown"
- "Unlock full Timeline history"

Bad paywall moments:
- before showing the user's Big 3;
- before displaying verified evidence status;
- before basic Daily guidance;
- by intentionally hiding uncertainty;
- by making free calculations less accurate.

### Entitlement behavior

Premium access must be controlled by durable entitlements.

Requirements:
- StoreKit / platform billing receipts are the source of purchase truth;
- restore purchases must work;
- entitlement state must survive app reinstall/sign-in;
- premium UI must fail closed when entitlement cannot be verified;
- server and client must agree on premium state;
- no premium feature should rely only on a local boolean.

### Upgrade presentation

Upsells must explain the concrete additional value.

Prefer:
"Unlock Emotional Rhythm — compare both Moon patterns and verified aspects."

Avoid:
"Upgrade to Premium for more."

Every premium gate should show:
- what the user already has;
- what additional evidence or depth will unlock;
- why that extra layer requires premium;
- one clear upgrade action;
- one clear way to continue free.

### Pricing strategy

Use a simple structure:

- Free
- Soul Codex+ Monthly
- Soul Codex+ Annual

Do not launch with multiple confusing paid tiers.

Annual should be the best-value plan, while monthly remains the lower-commitment entry point.

Pricing must be controlled from store configuration rather than hard-coded into interpretation logic.

### Monetization principle

Do not sell certainty.

Sell:
- depth;
- continuity;
- richer synthesis;
- more complete comparison;
- history;
- premium presentation;
- additional qualified systems.

Accuracy, honesty, provenance, and fail-closed behavior remain product-wide standards for both free and paid users.
