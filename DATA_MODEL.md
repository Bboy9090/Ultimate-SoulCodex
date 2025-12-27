# Soul Codex - Data Model Documentation

**Version:** 1.0  
**Date:** December 2025  
**Status:** Shippable  

---

## Overview

This document defines the complete data model for Soul Codex, including all entities, fields, relationships, and validation rules. The system uses PostgreSQL as the primary database with Drizzle ORM for type-safe queries.

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌──────────────────┐
│   users     │────1:1──│  soul_profiles   │
└──────┬──────┘         └──────────────────┘
       │
       │1:N
       │
┌──────▼──────────┐
│  local_users    │
└─────────────────┘

┌─────────────┐         ┌────────────────────────┐
│   users     │────1:N──│      persons           │
└──────┬──────┘         └────────┬───────────────┘
       │                         │
       │1:N                      │M:N (via compatibility_analyses)
       │                         │
┌──────▼─────────────────┐      │
│  daily_insights        │      │
└────────────────────────┘      │
                                │
┌──────▼─────────────────────────▼─────┐
│      compatibility_analyses          │
└──────────────────────────────────────┘

┌─────────────┐         ┌────────────────────────┐
│   users     │────1:N──│ assessment_responses   │
└──────┬──────┘         └────────────────────────┘
       │
       │1:N
┌──────▼──────────┐
│  frequency_logs │
└─────────────────┘

┌─────────────┐         ┌────────────────────────┐
│   users     │────1:N──│  push_subscriptions    │
└─────────────┘         └────────────────────────┘

┌─────────────┐
│ access_codes│ (standalone, referenced by users)
└─────────────┘

┌─────────────┐
│  sessions   │ (managed by express-session)
└─────────────┘
```

---

## Core Entities

### 1. UserProfile Entity

**Table Name:** `soul_profiles`  
**Description:** Complete soul blueprint data for a user, including astrological charts, numerology, Human Design, and all other mystical system calculations.

**Primary Key:** `id` (integer, auto-increment)

#### Fields

| Field Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `id` | integer | No | auto | Unique profile identifier |
| `userId` | integer | No | - | Foreign key to users table |
| `fullName` | varchar(255) | Yes | null | User's full name (optional for privacy) |
| `dateOfBirth` | date | No | - | Date of birth (YYYY-MM-DD) |
| `timeOfBirth` | time | Yes | null | Time of birth (HH:MM:SS), optional but needed for accurate astrology |
| `placeOfBirth` | varchar(255) | Yes | null | Birth location (city, country format) |
| `latitude` | decimal(9,6) | Yes | null | Birth location latitude (for chart calculations) |
| `longitude` | decimal(9,6) | Yes | null | Birth location longitude |
| `timezone` | varchar(50) | Yes | null | Birth location timezone (e.g., "America/New_York") |
| `attachmentStyle` | enum | Yes | null | Psychological attachment: secure, anxious, avoidant, disorganized |
| `loveLanguages` | json | Yes | null | Array of love languages: ["words", "touch", "gifts", "service", "time"] |
| `astrologyData` | jsonb | Yes | null | Complete natal chart data (planets, houses, aspects) |
| `numerologyData` | jsonb | Yes | null | Life path, destiny, soul urge, personality numbers |
| `humanDesignData` | jsonb | Yes | null | Type, authority, strategy, centers, gates, channels |
| `chineseAstrologyData` | jsonb | Yes | null | Zodiac animal, element, stem-branch |
| `vedicAstrologyData` | jsonb | Yes | null | Rashi, nakshatra, planetary periods (dasha) |
| `biorhythmsData` | jsonb | Yes | null | Physical, emotional, intellectual cycle baselines |
| `chakrasData` | jsonb | Yes | null | Chakra system analysis |
| `ayurvedaData` | jsonb | Yes | null | Dosha type and balance |
| `otherSystemsData` | jsonb | Yes | null | Other mystical systems (Gene Keys, Mayan, etc.) |
| `createdAt` | timestamp | No | now() | Profile creation timestamp |
| `updatedAt` | timestamp | No | now() | Last profile update timestamp |

#### Indexes
- Primary key on `id`
- Unique index on `userId` (one profile per user)
- Index on `dateOfBirth` (for batch calculations)
- Index on `createdAt` (for analytics)

#### Relationships
- Belongs to: `users` (userId → users.id)

#### Validation Rules
- `dateOfBirth`: Must be between 1900-01-01 and current date
- `timeOfBirth`: Must be valid HH:MM format (00:00 to 23:59)
- `latitude`: Must be between -90 and 90
- `longitude`: Must be between -180 and 180
- `attachmentStyle`: Must be one of: "secure", "anxious", "avoidant", "disorganized"
- `loveLanguages`: Must be array of valid love language codes
- JSON fields: Must be valid JSON, validated by application schema

#### JSONB Schema Examples

**astrologyData:**
```json
{
  "sun": { "sign": "Capricorn", "degree": 15.23, "house": 10 },
  "moon": { "sign": "Gemini", "degree": 8.45, "house": 3 },
  "rising": { "sign": "Aries", "degree": 12.34 },
  "planets": {
    "mercury": { "sign": "Sagittarius", "degree": 22.67, "house": 9, "retrograde": false },
    "venus": { "sign": "Aquarius", "degree": 5.89, "house": 11, "retrograde": false },
    "mars": { "sign": "Leo", "degree": 18.23, "house": 5, "retrograde": false },
    "jupiter": { "sign": "Pisces", "degree": 10.45, "house": 12, "retrograde": false },
    "saturn": { "sign": "Aquarius", "degree": 3.21, "house": 11, "retrograde": false },
    "uranus": { "sign": "Capricorn", "degree": 25.78, "house": 10, "retrograde": true },
    "neptune": { "sign": "Capricorn", "degree": 14.56, "house": 10, "retrograde": false },
    "pluto": { "sign": "Scorpio", "degree": 20.34, "house": 8, "retrograde": false }
  },
  "houses": [
    { "number": 1, "cusp": "Aries", "degree": 12.34 },
    { "number": 2, "cusp": "Taurus", "degree": 18.45 }
    // ... houses 3-12
  ],
  "aspects": [
    { "planet1": "sun", "planet2": "jupiter", "type": "trine", "orb": 2.3, "applying": true },
    { "planet1": "moon", "planet2": "mars", "type": "square", "orb": 3.1, "applying": false }
    // ... more aspects
  ],
  "houseSystem": "Placidus"
}
```

**numerologyData:**
```json
{
  "lifePath": { "number": 7, "calculation": "1+5+1+1+1+9+9+0=27, 2+7=9" },
  "destiny": { "number": 11, "calculation": "from full name" },
  "soulUrge": { "number": 3, "calculation": "from vowels" },
  "personality": { "number": 8, "calculation": "from consonants" },
  "birthDay": 15,
  "attitude": 6,
  "maturity": { "number": 22, "age": 36 }
}
```

**humanDesignData:**
```json
{
  "type": "Manifesting Generator",
  "profile": "6/2",
  "authority": "Sacral",
  "strategy": "To Respond",
  "definition": "Single",
  "incarnationCross": "Right Angle Cross of Planning",
  "centers": {
    "head": { "defined": false },
    "ajna": { "defined": false },
    "throat": { "defined": true },
    "g": { "defined": true },
    "heart": { "defined": false },
    "spleen": { "defined": true },
    "sacral": { "defined": true },
    "solar": { "defined": false },
    "root": { "defined": true }
  },
  "gates": [
    { "gate": 5, "line": 1, "planet": "sun", "defined": true },
    { "gate": 14, "line": 3, "planet": "earth", "defined": true }
    // ... more gates
  ],
  "channels": [
    { "channel": "34-20", "name": "Charisma", "defined": true }
  ]
}
```

---

### 2. ChartResult Entity

**Table Name:** N/A (embedded in `soul_profiles.astrologyData`)  
**Description:** Astrological chart calculation results. This is not a separate table but a structured JSONB field within the soul_profiles table for performance and atomicity.

**Rationale:** Chart data is always accessed together with the profile and never independently. Storing as JSONB reduces joins and improves query performance.

**Alternative Implementation (if needed for querying):**
If we later need to query specific chart elements across users (e.g., "find all users with Sun in Capricorn"), we could create a `chart_elements` table:

```sql
CREATE TABLE chart_elements (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES soul_profiles(id),
  element_type VARCHAR(50) NOT NULL, -- 'planet', 'house', 'aspect'
  element_name VARCHAR(50) NOT NULL, -- 'sun', 'moon', etc.
  sign VARCHAR(50),
  house INTEGER,
  degree DECIMAL(5,2),
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_chart_elements_profile ON chart_elements(profile_id);
CREATE INDEX idx_chart_elements_type_name ON chart_elements(element_type, element_name);
```

**Current Decision:** Keep as JSONB in soul_profiles for MVP. Create separate table only if querying patterns require it.

---

### 3. CompatibilityResult Entity

**Table Name:** `compatibility_analyses`  
**Description:** Compatibility analysis results between two people (user profile and another person).

**Primary Key:** `id` (integer, auto-increment)

#### Fields

| Field Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `id` | integer | No | auto | Unique analysis identifier |
| `userId` | integer | No | - | Foreign key to users table (who requested) |
| `person1Id` | integer | No | - | Foreign key to persons table |
| `person2Id` | integer | No | - | Foreign key to persons table |
| `overallScore` | integer | No | - | Overall compatibility score (0-100) |
| `confidenceLevel` | enum | No | - | Confidence in analysis: high, medium, low |
| `scoresData` | jsonb | No | - | 5 pillars and detailed aspect scores |
| `synastryData` | jsonb | Yes | null | Astrological synastry aspects |
| `relationshipCategories` | jsonb | No | - | Labels and rationale (Soulmate, Best Friends, etc.) |
| `flags` | jsonb | Yes | null | Warning flags or special notes |
| `nudges` | jsonb | Yes | null | Actionable relationship advice |
| `version` | varchar(10) | No | '1.0' | Compatibility algorithm version |
| `createdAt` | timestamp | No | now() | Analysis creation timestamp |
| `updatedAt` | timestamp | No | now() | Last update timestamp |

#### Indexes
- Primary key on `id`
- Index on `userId` (find all analyses by user)
- Composite index on `(person1Id, person2Id)` (prevent duplicates, speed lookups)
- Index on `createdAt` (for analytics and sorting)

#### Relationships
- Belongs to: `users` (userId → users.id)
- Belongs to: `persons` (person1Id → persons.id)
- Belongs to: `persons` (person2Id → persons.id)

#### Validation Rules
- `overallScore`: Must be 0-100
- `confidenceLevel`: Must be "high", "medium", or "low"
- `person1Id` and `person2Id`: Must be different (can't compare person with themselves)
- Unique constraint: No duplicate analyses for same person pair (ordered)

#### JSONB Schema Examples

**scoresData:**
```json
{
  "attraction": { "value": 85, "error": 5 },
  "emotional": { "value": 92, "error": 3 },
  "lifestyle": { "value": 65, "error": 8 },
  "longTerm": { "value": 88, "error": 4 },
  "timing": { "value": 70, "error": 6 },
  "overall": { "value": 80, "error": 5 },
  "detailedAspects": {
    "sex": 88,
    "communication": 82,
    "trust": 90,
    "friendship": 95,
    "emotionalConnection": 92,
    "intimacy": 85,
    "commonValues": 78,
    "colleagues": 70,
    "marriage": 88,
    "overall": 85,
    "relationship": 84
  }
}
```

**synastryData:**
```json
{
  "overallScore": 85,
  "goldenAspects": [
    {
      "person1Planet": "Venus",
      "person2Planet": "Moon",
      "aspect": "trine",
      "orb": 2.3,
      "tier": "golden",
      "description": "Deep emotional and romantic harmony",
      "impact": "harmony",
      "score": 95
    }
  ],
  "diamondAspects": [
    {
      "person1Planet": "Mars",
      "person2Planet": "Venus",
      "aspect": "conjunction",
      "orb": 1.5,
      "tier": "diamond",
      "description": "Strong physical attraction and passion",
      "impact": "harmony",
      "score": 92
    }
  ],
  "fatedAspects": [
    {
      "person1Planet": "North Node",
      "person2Planet": "Sun",
      "aspect": "conjunction",
      "orb": 3.0,
      "tier": "fated",
      "description": "Destined connection, soul growth together",
      "impact": "growth",
      "score": 88
    }
  ],
  "otherAspects": [
    {
      "person1Planet": "Moon",
      "person2Planet": "Saturn",
      "aspect": "square",
      "orb": 3.5,
      "tier": "standard",
      "description": "Emotional restrictions, needs patience",
      "impact": "tension",
      "score": 45
    }
  ],
  "houseOverlays": {
    "person1Planets": [
      {
        "planet": "Venus",
        "house": 7,
        "significance": "Romantic attraction felt by both",
        "impact": "profound"
      }
    ],
    "person2Planets": [
      {
        "planet": "Sun",
        "house": 10,
        "significance": "Admiration for career and public image",
        "impact": "moderate"
      }
    ]
  },
  "chemistry": {
    "score": 90,
    "description": "Intense physical and emotional chemistry"
  },
  "commitment": {
    "score": 85,
    "description": "Strong long-term potential, stable foundation"
  },
  "growth": {
    "score": 78,
    "description": "Support each other's evolution, some challenges"
  },
  "summary": {
    "strengths": [
      "Deep emotional connection",
      "Strong physical chemistry",
      "Shared values and life goals"
    ],
    "challenges": [
      "Different communication styles",
      "Varying social needs"
    ],
    "soulMateIndicators": [
      "Venus trine Moon",
      "North Node conjunction Sun",
      "Multiple fated aspects"
    ],
    "relationshipType": "Soulmate"
  }
}
```

**relationshipCategories:**
```json
[
  {
    "label": "Soulmate",
    "rationale": "Deep emotional connection and fated aspects suggest soul-level bond",
    "dominantPillars": ["emotional", "attraction", "longTerm"],
    "strength": 95
  },
  {
    "label": "Great Match",
    "rationale": "Strong compatibility across all major areas",
    "dominantPillars": ["attraction", "emotional", "lifestyle"],
    "strength": 88
  }
]
```

---

### 4. Notes Entity (Journal Entries)

**Table Name:** `journal_entries` (to be created in v1)  
**Description:** User reflections, journal entries, and notes tied to daily insights or free-form writing.

**Primary Key:** `id` (integer, auto-increment)

#### Fields

| Field Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `id` | integer | No | auto | Unique entry identifier |
| `userId` | integer | No | - | Foreign key to users table |
| `entryDate` | date | No | today | Date of journal entry |
| `promptId` | varchar(50) | Yes | null | Reference to prompt that inspired entry (if any) |
| `promptText` | text | Yes | null | Text of the prompt used |
| `entryText` | text | No | - | User's journal entry content |
| `tags` | jsonb | Yes | null | Array of tags for categorization |
| `mood` | varchar(50) | Yes | null | User's mood when writing (happy, sad, anxious, etc.) |
| `isPrivate` | boolean | No | true | Whether entry is private (always true for now) |
| `createdAt` | timestamp | No | now() | Entry creation timestamp |
| `updatedAt` | timestamp | No | now() | Last update timestamp |

#### Indexes
- Primary key on `id`
- Index on `userId` (find all entries by user)
- Index on `entryDate` (sort and filter by date)
- Index on `createdAt` (chronological ordering)
- GIN index on `tags` (for tag-based searches)

#### Relationships
- Belongs to: `users` (userId → users.id)

#### Validation Rules
- `entryText`: Minimum 1 character, maximum 10,000 characters
- `entryDate`: Cannot be in the future
- `tags`: Must be array of strings, max 10 tags per entry
- `mood`: If provided, must be from predefined list

#### Example Record
```json
{
  "id": 123,
  "userId": 456,
  "entryDate": "2025-12-27",
  "promptId": "daily_emotion_check",
  "promptText": "What emotions are surfacing for you today? How can you honor them?",
  "entryText": "Feeling a mix of excitement and anxiety about the new project. The Moon in Pisces is definitely amplifying my emotions. I'm going to honor this by taking time to meditate before diving into work.",
  "tags": ["emotions", "work", "meditation", "moon-in-pisces"],
  "mood": "contemplative",
  "isPrivate": true,
  "createdAt": "2025-12-27T08:30:00Z",
  "updatedAt": "2025-12-27T08:30:00Z"
}
```

---

## Supporting Entities

### 5. Users Entity

**Table Name:** `users`  
**Description:** Core user accounts, supports multiple authentication methods.

#### Fields

| Field Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `id` | integer | No | auto | Unique user identifier |
| `email` | varchar(255) | Yes | null | User email (null for anonymous sessions) |
| `emailVerified` | boolean | No | false | Email verification status |
| `accessCodeUsed` | varchar(50) | Yes | null | Access code used for registration |
| `tier` | enum | No | 'free' | Subscription tier: free, premium, admin |
| `stripeCustomerId` | varchar(255) | Yes | null | Stripe customer ID for subscriptions |
| `createdAt` | timestamp | No | now() | Account creation timestamp |
| `updatedAt` | timestamp | No | now() | Last update timestamp |

#### Indexes
- Primary key on `id`
- Unique index on `email`
- Index on `tier` (for analytics)
- Index on `accessCodeUsed` (for access code tracking)

---

### 6. LocalUsers Entity

**Table Name:** `local_users`  
**Description:** Password-based authentication for users.

#### Fields

| Field Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `id` | integer | No | auto | Unique local user identifier |
| `userId` | integer | No | - | Foreign key to users table |
| `password` | varchar(255) | No | - | Hashed password (Argon2) |
| `createdAt` | timestamp | No | now() | Account creation timestamp |
| `updatedAt` | timestamp | No | now() | Last update timestamp |

#### Indexes
- Primary key on `id`
- Unique index on `userId` (one local auth per user)

#### Security
- Passwords hashed with Argon2 (never stored plain text)
- Minimum password length: 8 characters
- Password complexity requirements enforced at application level

---

### 7. Persons Entity

**Table Name:** `persons`  
**Description:** Saved people for compatibility analysis (partners, friends, family, etc.).

#### Fields

| Field Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `id` | integer | No | auto | Unique person identifier |
| `userId` | integer | No | - | Foreign key to users table (owner) |
| `fullName` | varchar(255) | No | - | Person's full name |
| `dateOfBirth` | date | No | - | Date of birth |
| `timeOfBirth` | time | Yes | null | Time of birth (optional) |
| `placeOfBirth` | varchar(255) | Yes | null | Birth location |
| `latitude` | decimal(9,6) | Yes | null | Birth location latitude |
| `longitude` | decimal(9,6) | Yes | null | Birth location longitude |
| `timezone` | varchar(50) | Yes | null | Birth location timezone |
| `relationship` | varchar(50) | Yes | null | Relationship type: partner, friend, family, colleague, crush, ex, other |
| `attachmentStyle` | enum | Yes | null | Attachment style (if known) |
| `loveLanguages` | jsonb | Yes | null | Love languages array |
| `notes` | text | Yes | null | Private notes about this person |
| `chartData` | jsonb | Yes | null | Cached astrological chart data |
| `createdAt` | timestamp | No | now() | Record creation timestamp |
| `updatedAt` | timestamp | No | now() | Last update timestamp |

#### Indexes
- Primary key on `id`
- Index on `userId` (find all people for a user)
- Index on `relationship` (filter by relationship type)
- Index on `createdAt` (sort by recently added)

#### Relationships
- Belongs to: `users` (userId → users.id)
- Has many: `compatibility_analyses` (via person1Id or person2Id)

---

### 8. DailyInsights Entity

**Table Name:** `daily_insights`  
**Description:** Pre-generated or cached daily insights for users based on transits and profile.

#### Fields

| Field Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `id` | integer | No | auto | Unique insight identifier |
| `userId` | integer | No | - | Foreign key to users table |
| `insightDate` | date | No | - | Date this insight is for |
| `moonSign` | varchar(50) | Yes | null | Moon sign for this day |
| `moonHouse` | integer | Yes | null | House Moon is transiting |
| `keyTransits` | jsonb | No | - | Major transits affecting user today |
| `biorhythms` | jsonb | No | - | Physical, emotional, intellectual cycles |
| `energySummary` | text | Yes | null | AI-generated energy summary |
| `reflectionPrompt` | text | Yes | null | Personalized reflection prompt |
| `affirmations` | jsonb | Yes | null | Array of 3-5 affirmations |
| `cosmicGuidance` | text | Yes | null | AI-generated guidance |
| `createdAt` | timestamp | No | now() | Insight generation timestamp |

#### Indexes
- Primary key on `id`
- Unique composite index on `(userId, insightDate)` (one insight per user per day)
- Index on `insightDate` (for cleanup of old insights)

#### Example keyTransits JSONB
```json
[
  {
    "transit": "Moon in Pisces",
    "house": 3,
    "significance": "Heightened intuition and creativity in communication"
  },
  {
    "transit": "Mercury Sextile Venus",
    "orb": 1.2,
    "significance": "Great day for heartfelt conversations and artistic expression"
  }
]
```

---

### 9. AccessCodes Entity

**Table Name:** `access_codes`  
**Description:** Invitation/access codes for tiered registration.

#### Fields

| Field Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `id` | integer | No | auto | Unique code identifier |
| `code` | varchar(50) | No | - | Access code string |
| `tier` | enum | No | - | Tier granted: free, premium, admin |
| `usesRemaining` | integer | Yes | null | Uses left (null = unlimited) |
| `expiresAt` | timestamp | Yes | null | Expiration date (null = never) |
| `createdBy` | integer | Yes | null | Foreign key to users table (admin who created) |
| `createdAt` | timestamp | No | now() | Code creation timestamp |

#### Indexes
- Primary key on `id`
- Unique index on `code`
- Index on `tier` (for analytics)

---

### 10. PushSubscriptions Entity

**Table Name:** `push_subscriptions`  
**Description:** Web Push notification subscriptions for users.

#### Fields

| Field Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `id` | integer | No | auto | Unique subscription identifier |
| `userId` | integer | No | - | Foreign key to users table |
| `endpoint` | text | No | - | Push service endpoint URL |
| `keys` | jsonb | No | - | Push subscription keys (p256dh, auth) |
| `createdAt` | timestamp | No | now() | Subscription creation timestamp |

#### Indexes
- Primary key on `id`
- Index on `userId` (find all subscriptions for user)
- Unique index on `endpoint` (prevent duplicate subscriptions)

---

### 11. Sessions Entity

**Table Name:** `sessions`  
**Description:** Express-session storage (managed by connect-pg-simple).

#### Fields

| Field Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `sid` | varchar(255) | No | - | Session ID (primary key) |
| `sess` | jsonb | No | - | Session data |
| `expire` | timestamp | No | - | Session expiration timestamp |

#### Indexes
- Primary key on `sid`
- Index on `expire` (for cleanup of expired sessions)

---

## Data Relationships Summary

### User → Profile (1:1)
- Each user has one soul profile
- Profile created upon first profile generation
- Cascade delete: If user deleted, profile deleted

### User → Persons (1:N)
- Each user can save multiple people
- People belong to one user only
- Cascade delete: If user deleted, all their saved people deleted

### Persons → CompatibilityAnalyses (M:N)
- Many-to-many through compatibility_analyses table
- Two persons can have one compatibility analysis
- Cascade delete: If person deleted, their compatibility analyses deleted

### User → CompatibilityAnalyses (1:N)
- Each user can request multiple compatibility analyses
- Analysis belongs to requesting user
- Cascade delete: If user deleted, their analyses deleted

### User → DailyInsights (1:N)
- Each user can have multiple daily insights (one per day)
- Insights belong to one user
- Cascade delete: If user deleted, insights deleted

### User → JournalEntries (1:N)
- Each user can have multiple journal entries
- Entries belong to one user
- Cascade delete: If user deleted, entries deleted

### User → PushSubscriptions (1:N)
- Each user can have multiple push subscriptions (different devices)
- Subscriptions belong to one user
- Cascade delete: If user deleted, subscriptions deleted

---

## Data Access Patterns

### High-Frequency Reads
1. **Load user profile:** `SELECT * FROM soul_profiles WHERE userId = ?`
2. **Load compatibility report:** `SELECT * FROM compatibility_analyses WHERE id = ?`
3. **Load today's insights:** `SELECT * FROM daily_insights WHERE userId = ? AND insightDate = ?`
4. **List saved people:** `SELECT * FROM persons WHERE userId = ? ORDER BY createdAt DESC`

### High-Frequency Writes
1. **Create profile:** `INSERT INTO soul_profiles (...) VALUES (...)`
2. **Update profile data:** `UPDATE soul_profiles SET astrologyData = ? WHERE userId = ?`
3. **Generate compatibility:** `INSERT INTO compatibility_analyses (...) VALUES (...)`
4. **Save daily insight:** `INSERT INTO daily_insights (...) VALUES (...)`

### Batch Operations
1. **Cleanup old insights:** `DELETE FROM daily_insights WHERE insightDate < NOW() - INTERVAL '90 days'`
2. **Cleanup expired sessions:** `DELETE FROM sessions WHERE expire < NOW()`
3. **Analytics queries:** Aggregate user data, subscription metrics

---

## Data Validation & Constraints

### Application-Level Validation
- Birth date must be reasonable (1900-present)
- Birth time must be valid HH:MM format
- Location must geocode successfully
- JSON fields must match application schemas
- Compatibility cannot be between same person

### Database-Level Constraints
- Foreign key constraints with CASCADE DELETE
- Unique constraints on user profiles, access codes
- Check constraints on score ranges (0-100)
- NOT NULL constraints on required fields
- JSONB validation (valid JSON syntax)

### Data Integrity
- Transactions for multi-table operations
- Optimistic locking for concurrent updates (using updatedAt)
- Cascade deletes to maintain referential integrity
- Periodic cleanup jobs for expired data

---

## Data Security & Privacy

### Encryption
- All data encrypted at rest (PostgreSQL encryption)
- All data encrypted in transit (HTTPS, TLS)
- Sensitive fields (birth data) never logged

### Access Control
- Row-level security: Users can only access their own data
- API authentication required for all writes
- Session-based authentication for reads
- Admin tier has elevated permissions (manage access codes)

### GDPR Compliance
- Right to access: Export all user data as JSON
- Right to deletion: Hard delete all user records and related data
- Right to portability: JSON export includes all linked records
- Consent tracking: Terms acceptance logged in sessions

### Anonymization
- Anonymous users: Session-based, no persistent user record
- Anonymous profiles: Stored in session, not database
- Upgrade path: Convert anonymous session to registered account

---

## Data Migration Strategy

### Schema Versioning
- Migrations managed by Drizzle Kit
- Sequential numbering: 0001_initial.sql, 0002_add_journal.sql
- Rollback scripts for each migration
- No destructive changes without backups

### Backward Compatibility
- Additive changes preferred (new columns nullable)
- Feature flags for breaking changes
- API versioning for client compatibility
- Deprecation warnings before removals

### Data Backups
- Daily automated PostgreSQL backups (Neon/Render)
- Point-in-time recovery available
- Backup retention: 30 days
- Backup testing: Monthly restore verification

---

## Performance Optimization

### Indexing Strategy
- Primary keys on all tables
- Foreign key indexes for joins
- Composite indexes for common queries
- GIN indexes for JSONB searches (if needed)
- BRIN indexes for large time-series tables

### Query Optimization
- Avoid N+1 queries (use joins or batch loads)
- Use connection pooling (Neon serverless)
- Cache expensive calculations (charts, compatibility)
- Pagination for large result sets
- Selective column loading (don't always load full JSONB)

### Caching Strategy
- Chart calculations cached in soul_profiles.astrologyData
- Daily insights cached for 24 hours
- Compatibility reports cached indefinitely (invalidate on profile update)
- Session data cached in PostgreSQL (not Redis for simplicity)

---

## Data Lifecycle Management

### Creation
- Profiles created on first user onboarding
- Persons created on-demand by user
- Compatibility analyses created on request
- Daily insights pre-generated or generated on-demand

### Updates
- Profiles updated when user edits birth data (triggers recalculation)
- Persons updated when user edits saved person
- Compatibility analyses NOT updated (historical record), new analysis created
- Daily insights NOT updated (snapshot in time)

### Deletion
- User deletion cascades to all owned records
- Person deletion cascades to compatibility analyses involving them
- Soft delete not implemented (GDPR requires hard delete)
- Retention policy: No automatic deletion, user-initiated only

---

## Appendix: SQL Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  access_code_used VARCHAR(50),
  tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'admin')),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Local users (password auth)
CREATE TABLE local_users (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Soul profiles
CREATE TABLE soul_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  date_of_birth DATE NOT NULL,
  time_of_birth TIME,
  place_of_birth VARCHAR(255),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  timezone VARCHAR(50),
  attachment_style VARCHAR(20) CHECK (attachment_style IN ('secure', 'anxious', 'avoidant', 'disorganized')),
  love_languages JSONB,
  astrology_data JSONB,
  numerology_data JSONB,
  human_design_data JSONB,
  chinese_astrology_data JSONB,
  vedic_astrology_data JSONB,
  biorhythms_data JSONB,
  chakras_data JSONB,
  ayurveda_data JSONB,
  other_systems_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_soul_profiles_user_id ON soul_profiles(user_id);
CREATE INDEX idx_soul_profiles_dob ON soul_profiles(date_of_birth);

-- Persons (saved people)
CREATE TABLE persons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  time_of_birth TIME,
  place_of_birth VARCHAR(255),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  timezone VARCHAR(50),
  relationship VARCHAR(50),
  attachment_style VARCHAR(20),
  love_languages JSONB,
  notes TEXT,
  chart_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_persons_user_id ON persons(user_id);
CREATE INDEX idx_persons_relationship ON persons(relationship);

-- Compatibility analyses
CREATE TABLE compatibility_analyses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person1_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  person2_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  confidence_level VARCHAR(20) NOT NULL CHECK (confidence_level IN ('high', 'medium', 'low')),
  scores_data JSONB NOT NULL,
  synastry_data JSONB,
  relationship_categories JSONB NOT NULL,
  flags JSONB,
  nudges JSONB,
  version VARCHAR(10) DEFAULT '1.0',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (person1_id != person2_id),
  UNIQUE(person1_id, person2_id)
);

CREATE INDEX idx_compatibility_user_id ON compatibility_analyses(user_id);
CREATE INDEX idx_compatibility_persons ON compatibility_analyses(person1_id, person2_id);

-- Daily insights
CREATE TABLE daily_insights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_date DATE NOT NULL,
  moon_sign VARCHAR(50),
  moon_house INTEGER,
  key_transits JSONB NOT NULL,
  biorhythms JSONB NOT NULL,
  energy_summary TEXT,
  reflection_prompt TEXT,
  affirmations JSONB,
  cosmic_guidance TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, insight_date)
);

CREATE INDEX idx_daily_insights_user_id ON daily_insights(user_id);
CREATE INDEX idx_daily_insights_date ON daily_insights(insight_date);

-- Journal entries (v1 feature)
CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prompt_id VARCHAR(50),
  prompt_text TEXT,
  entry_text TEXT NOT NULL,
  tags JSONB,
  mood VARCHAR(50),
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_tags ON journal_entries USING GIN(tags);

-- Access codes
CREATE TABLE access_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'premium', 'admin')),
  uses_remaining INTEGER,
  expires_at TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_access_codes_code ON access_codes(code);

-- Push subscriptions
CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Sessions (managed by connect-pg-simple)
CREATE TABLE sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX idx_sessions_expire ON sessions(expire);

-- Assessment responses (for future assessments/quizzes)
CREATE TABLE assessment_responses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_type VARCHAR(50) NOT NULL,
  responses JSONB NOT NULL,
  score INTEGER,
  result TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assessment_user_id ON assessment_responses(user_id);

-- Frequency logs (for analytics)
CREATE TABLE frequency_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_frequency_logs_user_id ON frequency_logs(user_id);
CREATE INDEX idx_frequency_logs_event_type ON frequency_logs(event_type);
CREATE INDEX idx_frequency_logs_created_at ON frequency_logs(created_at);
```

---

**Document Owner:** Engineering Team  
**Last Updated:** December 27, 2025  
**Review Cycle:** Quarterly or with major schema changes  
**Status:** Approved for Development
