# Data Safety Form — Google Play Console

Fill this in under **App content → Data safety** in Play Console.
Your answers must match what the app actually does. Lying gets the app pulled.

---

## 1. Data collection & security (top-level)

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS only) |
| Do you provide a way for users to request that their data be deleted? | **Yes** (in-app: Profile → Account → Delete my account, plus support@soulcodex.app) |

---

## 2. Data types collected

### Personal info
| Type | Collected | Shared | Optional / Required | Purpose |
|---|---|---|---|---|
| Name | Yes | No | Required | App functionality (used in personalized readings) |
| Email address | Yes | No | Required (account holders only) | Account management, App functionality |
| User IDs | Yes | No | Required | Account management |
| Other info — date and place of birth | Yes | No | Required | App functionality (core to astrology / numerology calculations) |

### Financial info
| Type | Collected | Shared | Optional / Required | Purpose |
|---|---|---|---|---|
| Purchase history | Yes | No | Required (subscribers only) | Account management (premium entitlement) |

> Note: payment card details are **not** collected by Soul Codex. Payments are processed by Google Play Billing (and/or Stripe on the web), which collect those directly.

### App activity
| Type | Collected | Shared | Optional / Required | Purpose |
|---|---|---|---|---|
| App interactions | Yes | No | Required | Analytics (Microsoft Clarity), App functionality |
| Other user-generated content — journal entries | Yes | No | Optional | App functionality |

### Messages
| Type | Collected | Shared | Optional / Required | Purpose |
|---|---|---|---|---|
| Other in-app messages — Soul Guide chat history | Yes | No | Optional | App functionality (so the AI guide remembers context within a session) |

### Device or other IDs
| Type | Collected | Shared | Optional / Required | Purpose |
|---|---|---|---|---|
| Device or other IDs (push subscription endpoint) | Yes | No | Optional (push opt-in only) | App functionality (delivering daily reading notifications) |

---

## 3. Data NOT collected (declare explicitly)

- Location (precise or approximate) — birth city is geocoded server-side from a city name; the device's location is never read
- Photos or videos
- Audio files
- Files and docs
- Calendar
- Contacts
- Web browsing history
- Health & fitness data
- Race, ethnicity, sexual orientation, political or religious beliefs
- Phone number
- Address
- Credit/debit card numbers (handled by Google Play Billing / Stripe directly)

---

## 4. Security practices

- Data encrypted in transit: **Yes** (HTTPS / TLS)
- Users can request data deletion: **Yes** — in-app at Profile → Account → Delete my account, OR by emailing support@soulcodex.app
- Independent security review: **No** (unless one is commissioned)
- Committed to Play Families Policy: **N/A** (not targeting children)

---

## 5. Reminder

Update this form whenever you:
- Add a new third-party SDK
- Start sharing data with a new partner
- Begin collecting a new data type (e.g., adding voice journaling)

Inconsistencies between the declared form and runtime behavior are the #1 reason Soul Codex–style apps get suspended.
