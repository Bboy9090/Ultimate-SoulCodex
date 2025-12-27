# Soul Codex: Data Model & Database Schema

**Version:** 1.0  
**Date:** December 27, 2025  
**Product:** Soul Codex - Personality & Compatibility App  
**Database:** PostgreSQL (Cloud) + IndexedDB (Local)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Core Entities](#3-core-entities)
4. [Relationships](#4-relationships)
5. [Database Schema](#5-database-schema)
6. [Data Flow](#6-data-flow)
7. [Sync Strategy](#7-sync-strategy)
8. [Data Migrations](#8-data-migrations)
9. [Security & Privacy](#9-security--privacy)

---

## 1. Overview

### 1.1 Design Principles

**Offline-First:**
- All data stored locally first (IndexedDB)
- Cloud sync is optional enhancement
- App fully functional without network

**User Ownership:**
- Users control their data
- Easy export in standard formats
- Complete deletion capability

**Privacy by Design:**
- Minimal data collection
- No selling to third parties
- Anonymous mode (no account required)
- Encrypted cloud storage

**Performance:**
- Optimized for mobile devices
- Lazy loading for large datasets
- Indexed queries for speed
- Denormalized where beneficial

### 1.2 Data Storage Layers

```
┌─────────────────────────────────────┐
│         Application Layer           │
│    (React Components & State)       │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      Local Storage Layer            │
│        (IndexedDB)                  │
│   • Profiles                        │
│   • Compatibility Results           │
│   • Journal Entries                 │
│   • Cached Calculations             │
│   • Sync Queue                      │
└────────────┬────────────────────────┘
             │ (Optional Sync)
┌────────────▼────────────────────────┐
│      Cloud Storage Layer            │
│      (PostgreSQL via API)           │
│   • User Accounts                   │
│   • Synced Profiles                 │
│   • Cross-Device Data               │
│   • Backup & Recovery               │
└─────────────────────────────────────┘
```

---

## 2. Architecture

### 2.1 Entity-Relationship Overview

```
                    ┌──────────────┐
                    │     User     │
                    │  (Optional)  │
                    └──────┬───────┘
                           │ 1:1
                    ┌──────▼───────┐
                    │  UserProfile │
                    │   (Core)     │
                    └──────┬───────┘
                           │ 1:1
             ┌─────────────┼─────────────┐
             │             │             │
      ┌──────▼───────┐ ┌──▼──────┐ ┌────▼────────┐
      │  ChartResult │ │Assessment│ │DailyInsight │
      │  (Calculated)│ │(Answers) │ │ (Generated) │
      └──────────────┘ └──────────┘ └─────────────┘
             
      ┌──────────────┐
      │PersonProfile │◄──────┐
      │ (Saved      │        │ 1:Many
      │  People)    │        │
      └──────┬───────┘  ┌─────┴─────┐
             │          │UserProfile│
             │          └───────────┘
             │ Many:Many
      ┌──────▼───────────┐
      │CompatibilityResult│
      │   (Analysis)      │
      └───────────────────┘

      ┌──────────────┐
      │JournalEntry  │◄────┐
      │  (Notes &    │     │ 1:Many
      │ Reflections) │     │
      └──────────────┘  ┌──┴────────┐
                        │UserProfile│
                        └───────────┘

      ┌──────────────┐
      │ Subscription │◄────┐
      │  (Payment &  │     │ 1:1
      │ Entitlement) │     │
      └──────────────┘  ┌──┴────────┐
                        │   User    │
                        └───────────┘
```

---

## 3. Core Entities

### 3.1 User

**Purpose:** Optional account for cloud sync and cross-device access

**Fields:**
- `id` (UUID, primary key)
- `email` (string, unique, nullable)
- `firstName` (string, nullable)
- `lastName` (string, nullable)
- `profileImageUrl` (string, nullable)
- `stripeCustomerId` (string, nullable, unique)
- `stripeSubscriptionId` (string, nullable)
- `subscriptionStatus` (enum: active, canceled, past_due, trialing, null)
- `subscriptionPlan` (enum: free, premium, ultimate, null)
- `subscriptionEndsAt` (timestamp, nullable)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Indexes:**
- Primary: `id`
- Unique: `email`, `stripeCustomerId`

**Notes:**
- Optional entity - app works without user account
- Created when user signs up or opts into cloud sync
- Used for authentication and subscription management

---

### 3.2 LocalUser

**Purpose:** Local authentication data (separate from User for security)

**Fields:**
- `id` (UUID, primary key)
- `userId` (UUID, foreign key → User.id)
- `email` (string, unique)
- `passwordHash` (string, bcrypt/argon2)
- `lastLoginAt` (timestamp, nullable)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Indexes:**
- Primary: `id`
- Unique: `email`
- Foreign key: `userId` → `users.id`

**Notes:**
- Only created for email/password authentication
- Password hash never sent to client
- Separate table for security isolation

---

### 3.3 UserProfile

**Purpose:** Core user birth data and calculated results

**Fields:**

**Identity:**
- `id` (UUID, primary key)
- `userId` (UUID, foreign key → User.id, nullable)
- `sessionId` (string, nullable) - for anonymous users
- `displayName` (string, nullable)
- `pronouns` (string, nullable)
- `photoUrl` (string, nullable)

**Birth Data:**
- `birthDate` (date, required) - ISO 8601: YYYY-MM-DD
- `birthTime` (time, nullable) - HH:MM:SS (24-hour)
- `birthLocation` (string, nullable) - "City, Country"
- `birthLatitude` (decimal, nullable)
- `birthLongitude` (decimal, nullable)
- `birthTimezone` (string, nullable) - IANA timezone

**Metadata:**
- `completenessScore` (integer, 0-100) - profile completion percentage
- `lastCalculatedAt` (timestamp, nullable)
- `version` (integer, default 1) - for conflict resolution
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Indexes:**
- Primary: `id`
- Foreign key: `userId` → `users.id`
- Index: `sessionId` (for anonymous user lookups)
- Composite: `(userId, createdAt)` for efficient user profile queries

**Notes:**
- Either `userId` OR `sessionId` must be set
- Anonymous users use `sessionId` from browser session
- Can be migrated from anonymous to authenticated

---

### 3.4 ChartResult

**Purpose:** Calculated astrology, numerology, and other system results

**Fields:**

**Identity:**
- `id` (UUID, primary key)
- `profileId` (UUID, foreign key → UserProfile.id)

**Astrology:**
- `sunSign` (string) - e.g., "Capricorn"
- `sunDegree` (decimal) - exact degree
- `sunHouse` (integer, 1-12)
- `moonSign` (string)
- `moonDegree` (decimal)
- `moonHouse` (integer, 1-12)
- `risingSign` (string) - Ascendant
- `risingDegree` (decimal)
- `planetaryPositions` (JSONB) - all planet positions
  ```json
  {
    "Mercury": {"sign": "Capricorn", "degree": 15.23, "house": 10},
    "Venus": {"sign": "Aquarius", "degree": 3.45, "house": 11},
    ...
  }
  ```
- `houseCusps` (JSONB) - 12 house cusps
- `aspects` (JSONB) - major aspects array
  ```json
  [
    {"planet1": "Sun", "planet2": "Moon", "aspect": "trine", "orb": 2.3},
    ...
  ]
  ```

**Numerology:**
- `lifePathNumber` (integer, 1-9, 11, 22, 33)
- `expressionNumber` (integer)
- `soulUrgeNumber` (integer)
- `personalityNumber` (integer)
- `birthdayNumber` (integer)
- `karmicLessons` (integer array) - [3, 7]
- `pinnacles` (JSONB) - life period numbers
- `challenges` (JSONB) - life challenges

**Human Design:**
- `hdType` (enum: Generator, Manifesting Generator, Projector, Manifestor, Reflector)
- `hdStrategy` (string) - e.g., "To respond"
- `hdAuthority` (string) - e.g., "Sacral Authority"
- `hdProfile` (string) - e.g., "3/5"
- `hdDefinedCenters` (string array) - ["Sacral", "Throat", ...]
- `hdGates` (integer array) - [1, 13, 25, ...]
- `hdChannels` (string array) - ["10-20", "34-57", ...]
- `hdIncarnationCross` (string)

**Metadata:**
- `calculatedAt` (timestamp)
- `calculationVersion` (string) - for tracking algorithm versions
- `confidence` (enum: high, medium, low) - based on data completeness
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Indexes:**
- Primary: `id`
- Unique: `profileId` (one chart per profile)
- Foreign key: `profileId` → `user_profiles.id` (cascade delete)

**Notes:**
- JSONB fields for flexibility and performance
- Indexed JSONB for query performance on common fields
- Recalculated when birth data changes

---

### 3.5 Assessment

**Purpose:** Personality test responses and results (MBTI, Enneagram, etc.)

**Fields:**
- `id` (UUID, primary key)
- `profileId` (UUID, foreign key → UserProfile.id)
- `type` (enum: mbti, enneagram, big_five, attachment, love_languages)
- `responses` (JSONB) - question/answer pairs
  ```json
  {
    "q1": "A",
    "q2": "C",
    "q3": "B",
    ...
  }
  ```
- `result` (JSONB) - calculated results
  ```json
  {
    "type": "INFJ",
    "dimensions": {
      "E/I": {"score": 65, "preference": "I"},
      "S/N": {"score": 78, "preference": "N"},
      "T/F": {"score": 52, "preference": "F"},
      "J/P": {"score": 81, "preference": "J"}
    }
  }
  ```
- `completedAt` (timestamp)
- `createdAt` (timestamp)

**Indexes:**
- Primary: `id`
- Composite: `(profileId, type)` unique - one assessment per type per profile
- Foreign key: `profileId` → `user_profiles.id` (cascade delete)

**Notes:**
- Separate row for each assessment type
- Responses stored for re-scoring if algorithms change
- Result includes detailed breakdown, not just final type

---

### 3.6 PersonProfile

**Purpose:** Other people added for compatibility analysis

**Fields:**

**Identity:**
- `id` (UUID, primary key)
- `ownerProfileId` (UUID, foreign key → UserProfile.id) - who added this person
- `userId` (UUID, nullable) - if person has their own account
- `sessionId` (string, nullable) - for anonymous owners

**Basic Info:**
- `name` (string, required)
- `relationshipType` (enum: romantic, friend, family, colleague, other)
- `photoUrl` (string, nullable)
- `notes` (text, nullable) - private notes about this person

**Birth Data:**
- `birthDate` (date, nullable)
- `birthTime` (time, nullable)
- `birthLocation` (string, nullable)
- `birthLatitude` (decimal, nullable)
- `birthLongitude` (decimal, nullable)
- `birthTimezone` (string, nullable)

**Calculated Data:**
- `chartData` (JSONB, nullable) - subset of ChartResult for this person
- `lastCalculatedAt` (timestamp, nullable)

**Metadata:**
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Indexes:**
- Primary: `id`
- Foreign key: `ownerProfileId` → `user_profiles.id` (cascade delete)
- Composite: `(ownerProfileId, name)` for efficient lookups
- Index: `sessionId` for anonymous users

**Notes:**
- Lightweight version of UserProfile for others
- Only store data necessary for compatibility
- Can link to full UserProfile if person also uses app

---

### 3.7 CompatibilityAnalysis

**Purpose:** Calculated compatibility between two profiles

**Fields:**

**Identity:**
- `id` (UUID, primary key)
- `profile1Id` (UUID, foreign key → UserProfile.id)
- `profile2Id` (UUID, foreign key → PersonProfile.id)
- `sessionId` (string, nullable) - for anonymous users

**Scores:**
- `overallScore` (integer, 0-100)
- `overallError` (integer) - ±N error margin
- `confidenceLevel` (enum: high, medium, low)

**Pillar Scores:**
- `attractionScore` (integer, 0-100, nullable)
- `attractionError` (integer, nullable)
- `emotionalScore` (integer, 0-100, nullable)
- `emotionalError` (integer, nullable)
- `communicationScore` (integer, 0-100, nullable)
- `communicationError` (integer, nullable)
- `lifestyleScore` (integer, 0-100, nullable)
- `lifestyleError` (integer, nullable)
- `longTermScore` (integer, 0-100, nullable)
- `longTermError` (integer, nullable)
- `timingScore` (integer, 0-100, nullable)
- `timingError` (integer, nullable)

**Insights:**
- `relationshipCategory` (enum: soulmate, karmic, growth, complementary, challenging, great_match, best_friends)
- `dominantPillars` (string array) - top 2-3 pillars
- `strengths` (text array) - ["Deep empathy", "Shared values", ...]
- `challenges` (text array) - ["Communication differences", ...]
- `advice` (text) - relationship guidance
- `synastryData` (JSONB, nullable) - astrological synastry
  ```json
  {
    "goldenAspects": [...],
    "diamondAspects": [...],
    "houseOverlays": {...},
    "chemistry": {"score": 85, "description": "..."},
    "commitment": {"score": 78, "description": "..."}
  }
  ```

**Metadata:**
- `calculatedAt` (timestamp)
- `version` (string) - algorithm version
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Indexes:**
- Primary: `id`
- Unique composite: `(profile1Id, profile2Id)` - one analysis per pair
- Foreign keys: 
  - `profile1Id` → `user_profiles.id`
  - `profile2Id` → `person_profiles.id`
- Index: `sessionId` for anonymous users

**Notes:**
- Cached results, recalculated on data changes
- Premium features (synastry) nullable for free users
- Bidirectional - order of profile1/profile2 doesn't matter

---

### 3.8 JournalEntry

**Purpose:** User reflections and daily writing

**Fields:**
- `id` (UUID, primary key)
- `profileId` (UUID, foreign key → UserProfile.id)
- `sessionId` (string, nullable) - for anonymous users
- `title` (string, nullable)
- `content` (text, required)
- `mood` (enum: happy, neutral, sad, anxious, excited, reflective, grateful, nullable)
- `tags` (string array) - ["growth", "relationship", "work", ...]
- `linkedPersonId` (UUID, foreign key → PersonProfile.id, nullable) - if entry relates to a person
- `linkedCompatibilityId` (UUID, foreign key → CompatibilityAnalysis.id, nullable)
- `linkedInsightId` (UUID, foreign key → DailyInsight.id, nullable) - if prompted by insight
- `isPrivate` (boolean, default true)
- `entryDate` (date) - date of journal entry (may differ from createdAt)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Indexes:**
- Primary: `id`
- Foreign key: `profileId` → `user_profiles.id` (cascade delete)
- Composite: `(profileId, entryDate)` for date-based queries
- Full-text index on `content` for search
- GIN index on `tags` for tag filtering

**Notes:**
- Private by default
- Can be linked to prompts, people, or compatibility reports
- Full-text search for finding entries

---

### 3.9 DailyInsight

**Purpose:** Generated daily forecasts and guidance

**Fields:**
- `id` (UUID, primary key)
- `profileId` (UUID, foreign key → UserProfile.id)
- `insightDate` (date, required)
- `headline` (string) - short summary
- `content` (text) - full insight text
- `currentTransits` (JSONB) - astrological transits for the day
  ```json
  {
    "moon": {"sign": "Gemini", "house": 3},
    "aspects": [
      {"type": "Venus sextile natal Moon", "description": "..."}
    ]
  }
  ```
- `personalDayNumber` (integer, 1-9) - numerology personal day
- `intention` (string) - suggested daily intention
- `affirmation` (string) - personalized affirmation
- `journalPrompt` (string) - suggested reflection question
- `templateId` (string) - for tracking template usage
- `generatedBy` (enum: ai, template, hybrid) - generation method
- `generatedAt` (timestamp)
- `viewedAt` (timestamp, nullable)
- `createdAt` (timestamp)

**Indexes:**
- Primary: `id`
- Unique composite: `(profileId, insightDate)` - one insight per day per profile
- Foreign key: `profileId` → `user_profiles.id` (cascade delete)
- Index: `insightDate` for date queries

**Notes:**
- Generated daily (can be pre-generated)
- Tracks whether user viewed insight
- Template ID for deduplication (avoid repeating templates)

---

### 3.10 AccessCode

**Purpose:** Promotional codes for premium access

**Fields:**
- `id` (UUID, primary key)
- `code` (string, unique) - e.g., "LAUNCH2025"
- `tier` (enum: premium, ultimate)
- `maxUses` (integer, nullable) - null = unlimited
- `usedCount` (integer, default 0)
- `expiresAt` (timestamp, nullable)
- `isActive` (boolean, default true)
- `createdBy` (string, nullable) - admin user
- `notes` (text, nullable) - internal notes
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Indexes:**
- Primary: `id`
- Unique: `code`

---

### 3.11 AccessCodeRedemption

**Purpose:** Track who redeemed which codes

**Fields:**
- `id` (UUID, primary key)
- `accessCodeId` (UUID, foreign key → AccessCode.id)
- `userId` (UUID, foreign key → User.id, nullable)
- `sessionId` (string, nullable)
- `redeemedAt` (timestamp)

**Indexes:**
- Primary: `id`
- Foreign keys:
  - `accessCodeId` → `access_codes.id`
  - `userId` → `users.id`
- Composite: `(userId, accessCodeId)` or `(sessionId, accessCodeId)` to prevent double-redemption

---

### 3.12 PushSubscription

**Purpose:** Web push notification subscriptions

**Fields:**
- `id` (UUID, primary key)
- `userId` (UUID, foreign key → User.id, nullable)
- `sessionId` (string, nullable)
- `endpoint` (string, unique)
- `p256dhKey` (string)
- `authKey` (string)
- `userAgent` (string, nullable)
- `isActive` (boolean, default true)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Indexes:**
- Primary: `id`
- Unique: `endpoint`
- Foreign key: `userId` → `users.id`
- Index: `sessionId`

---

### 3.13 FrequencyLog

**Purpose:** Track user's emotional/life state over time (Life Current Tracker)

**Fields:**
- `id` (UUID, primary key)
- `userId` (UUID, foreign key → User.id, nullable)
- `sessionId` (string, nullable)
- `logDate` (date, required)
- `energy` (integer, 1-10)
- `mood` (integer, 1-10)
- `clarity` (integer, 1-10)
- `connection` (integer, 1-10)
- `notes` (text, nullable)
- `createdAt` (timestamp)

**Indexes:**
- Primary: `id`
- Foreign key: `userId` → `users.id`
- Composite: `(userId, logDate)` or `(sessionId, logDate)`

---

### 3.14 Subscription

**Purpose:** Payment and entitlement tracking (redundant with User fields but detailed)

**Fields:**
- `id` (UUID, primary key)
- `userId` (UUID, foreign key → User.id)
- `stripeSubscriptionId` (string, unique)
- `stripePriceId` (string)
- `status` (enum: active, canceled, past_due, trialing, paused, incomplete)
- `plan` (enum: premium, ultimate)
- `billingInterval` (enum: weekly, monthly, yearly)
- `currentPeriodStart` (timestamp)
- `currentPeriodEnd` (timestamp)
- `cancelAtPeriodEnd` (boolean, default false)
- `trialEnd` (timestamp, nullable)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Indexes:**
- Primary: `id`
- Unique: `stripeSubscriptionId`
- Unique: `userId`
- Foreign key: `userId` → `users.id`

---

### 3.15 WebhookEvent

**Purpose:** Idempotency for Stripe webhook processing

**Fields:**
- `id` (UUID, primary key)
- `stripeEventId` (string, unique)
- `eventType` (string) - e.g., "customer.subscription.updated"
- `processedAt` (timestamp)
- `createdAt` (timestamp)

**Indexes:**
- Primary: `id`
- Unique: `stripeEventId`

---

## 4. Relationships

### 4.1 Entity Relationship Diagram (ERD)

```sql
User (optional)
  ├─ 1:1 → LocalUser (if using email auth)
  ├─ 1:1 → UserProfile (required for app use)
  ├─ 1:1 → Subscription (if premium)
  └─ 1:Many → PushSubscription

UserProfile
  ├─ 1:1 → ChartResult
  ├─ 1:Many → Assessment (one per type)
  ├─ 1:Many → PersonProfile (saved people)
  ├─ 1:Many → CompatibilityAnalysis (with saved people)
  ├─ 1:Many → JournalEntry
  ├─ 1:Many → DailyInsight (one per day)
  └─ 1:Many → FrequencyLog

PersonProfile
  ├─ Many:1 → UserProfile (owner)
  └─ 1:Many → CompatibilityAnalysis

CompatibilityAnalysis
  ├─ Many:1 → UserProfile (profile1)
  ├─ Many:1 → PersonProfile (profile2)
  └─ 1:Many → JournalEntry (optional link)

DailyInsight
  ├─ Many:1 → UserProfile
  └─ 1:Many → JournalEntry (optional link)

AccessCode
  └─ 1:Many → AccessCodeRedemption

AccessCodeRedemption
  ├─ Many:1 → AccessCode
  └─ Many:1 → User or SessionId
```

---

## 5. Database Schema

### 5.1 PostgreSQL Schema (DDL)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_image_url TEXT,
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255),
  subscription_status VARCHAR(50) CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', NULL)),
  subscription_plan VARCHAR(50) CHECK (subscription_plan IN ('free', 'premium', 'ultimate', NULL)),
  subscription_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- Local users (authentication)
CREATE TABLE local_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_local_users_email ON local_users(email);
CREATE INDEX idx_local_users_user_id ON local_users(user_id);

-- User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  display_name VARCHAR(100),
  pronouns VARCHAR(50),
  photo_url TEXT,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_location VARCHAR(255),
  birth_latitude DECIMAL(10, 7),
  birth_longitude DECIMAL(10, 7),
  birth_timezone VARCHAR(100),
  completeness_score INTEGER DEFAULT 0 CHECK (completeness_score >= 0 AND completeness_score <= 100),
  last_calculated_at TIMESTAMP,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_session_id ON user_profiles(session_id);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(user_id, created_at);

-- Chart results
CREATE TABLE chart_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  sun_sign VARCHAR(50),
  sun_degree DECIMAL(6, 2),
  sun_house INTEGER CHECK (sun_house >= 1 AND sun_house <= 12),
  moon_sign VARCHAR(50),
  moon_degree DECIMAL(6, 2),
  moon_house INTEGER CHECK (moon_house >= 1 AND moon_house <= 12),
  rising_sign VARCHAR(50),
  rising_degree DECIMAL(6, 2),
  planetary_positions JSONB,
  house_cusps JSONB,
  aspects JSONB,
  life_path_number INTEGER,
  expression_number INTEGER,
  soul_urge_number INTEGER,
  personality_number INTEGER,
  birthday_number INTEGER,
  karmic_lessons INTEGER[],
  pinnacles JSONB,
  challenges JSONB,
  hd_type VARCHAR(50) CHECK (hd_type IN ('Generator', 'Manifesting Generator', 'Projector', 'Manifestor', 'Reflector')),
  hd_strategy VARCHAR(100),
  hd_authority VARCHAR(100),
  hd_profile VARCHAR(20),
  hd_defined_centers VARCHAR(50)[],
  hd_gates INTEGER[],
  hd_channels VARCHAR(20)[],
  hd_incarnation_cross VARCHAR(255),
  calculated_at TIMESTAMP,
  calculation_version VARCHAR(20),
  confidence VARCHAR(20) CHECK (confidence IN ('high', 'medium', 'low')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chart_results_profile_id ON chart_results(profile_id);
CREATE INDEX idx_chart_results_sun_sign ON chart_results(sun_sign);
CREATE INDEX idx_chart_results_life_path ON chart_results(life_path_number);

-- Assessments
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('mbti', 'enneagram', 'big_five', 'attachment', 'love_languages')),
  responses JSONB,
  result JSONB,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile_id, type)
);

CREATE INDEX idx_assessments_profile_id ON assessments(profile_id);
CREATE INDEX idx_assessments_type ON assessments(profile_id, type);

-- Person profiles (saved people)
CREATE TABLE person_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  name VARCHAR(100) NOT NULL,
  relationship_type VARCHAR(50) CHECK (relationship_type IN ('romantic', 'friend', 'family', 'colleague', 'other')),
  photo_url TEXT,
  notes TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_location VARCHAR(255),
  birth_latitude DECIMAL(10, 7),
  birth_longitude DECIMAL(10, 7),
  birth_timezone VARCHAR(100),
  chart_data JSONB,
  last_calculated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_person_profiles_owner ON person_profiles(owner_profile_id);
CREATE INDEX idx_person_profiles_session ON person_profiles(session_id);
CREATE INDEX idx_person_profiles_name ON person_profiles(owner_profile_id, name);

-- Compatibility analyses
CREATE TABLE compatibility_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile1_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  profile2_id UUID NOT NULL REFERENCES person_profiles(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  overall_error INTEGER,
  confidence_level VARCHAR(20) CHECK (confidence_level IN ('high', 'medium', 'low')),
  attraction_score INTEGER CHECK (attraction_score >= 0 AND attraction_score <= 100),
  attraction_error INTEGER,
  emotional_score INTEGER CHECK (emotional_score >= 0 AND emotional_score <= 100),
  emotional_error INTEGER,
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 100),
  communication_error INTEGER,
  lifestyle_score INTEGER CHECK (lifestyle_score >= 0 AND lifestyle_score <= 100),
  lifestyle_error INTEGER,
  long_term_score INTEGER CHECK (long_term_score >= 0 AND long_term_score <= 100),
  long_term_error INTEGER,
  timing_score INTEGER CHECK (timing_score >= 0 AND timing_score <= 100),
  timing_error INTEGER,
  relationship_category VARCHAR(50) CHECK (relationship_category IN ('soulmate', 'karmic', 'growth', 'complementary', 'challenging', 'great_match', 'best_friends')),
  dominant_pillars VARCHAR(50)[],
  strengths TEXT[],
  challenges TEXT[],
  advice TEXT,
  synastry_data JSONB,
  calculated_at TIMESTAMP,
  version VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile1_id, profile2_id)
);

CREATE INDEX idx_compatibility_profile1 ON compatibility_analyses(profile1_id);
CREATE INDEX idx_compatibility_profile2 ON compatibility_analyses(profile2_id);
CREATE INDEX idx_compatibility_session ON compatibility_analyses(session_id);

-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  title VARCHAR(255),
  content TEXT NOT NULL,
  mood VARCHAR(50) CHECK (mood IN ('happy', 'neutral', 'sad', 'anxious', 'excited', 'reflective', 'grateful', NULL)),
  tags VARCHAR(50)[],
  linked_person_id UUID REFERENCES person_profiles(id) ON DELETE SET NULL,
  linked_compatibility_id UUID REFERENCES compatibility_analyses(id) ON DELETE SET NULL,
  linked_insight_id UUID REFERENCES daily_insights(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT TRUE,
  entry_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_journal_entries_profile ON journal_entries(profile_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(profile_id, entry_date);
CREATE INDEX idx_journal_entries_tags ON journal_entries USING GIN(tags);
CREATE INDEX idx_journal_entries_search ON journal_entries USING GIN(to_tsvector('english', content));

-- Daily insights
CREATE TABLE daily_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  insight_date DATE NOT NULL,
  headline VARCHAR(255),
  content TEXT,
  current_transits JSONB,
  personal_day_number INTEGER CHECK (personal_day_number >= 1 AND personal_day_number <= 9),
  intention VARCHAR(255),
  affirmation TEXT,
  journal_prompt TEXT,
  template_id VARCHAR(100),
  generated_by VARCHAR(20) CHECK (generated_by IN ('ai', 'template', 'hybrid')),
  generated_at TIMESTAMP,
  viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile_id, insight_date)
);

CREATE INDEX idx_daily_insights_profile ON daily_insights(profile_id);
CREATE INDEX idx_daily_insights_date ON daily_insights(insight_date);

-- Access codes
CREATE TABLE access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  tier VARCHAR(20) CHECK (tier IN ('premium', 'ultimate')),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_access_codes_code ON access_codes(code);

-- Access code redemptions
CREATE TABLE access_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code_id UUID NOT NULL REFERENCES access_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  redeemed_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT user_or_session_redemption CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_redemptions_code ON access_code_redemptions(access_code_id);
CREATE INDEX idx_redemptions_user ON access_code_redemptions(user_id);
CREATE INDEX idx_redemptions_session ON access_code_redemptions(session_id);
CREATE UNIQUE INDEX idx_redemptions_unique_user ON access_code_redemptions(user_id, access_code_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_redemptions_unique_session ON access_code_redemptions(session_id, access_code_id) WHERE session_id IS NOT NULL;

-- Push subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  endpoint TEXT UNIQUE NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_push_endpoint ON push_subscriptions(endpoint);
CREATE INDEX idx_push_user ON push_subscriptions(user_id);
CREATE INDEX idx_push_session ON push_subscriptions(session_id);

-- Frequency logs
CREATE TABLE frequency_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  log_date DATE NOT NULL,
  energy INTEGER CHECK (energy >= 1 AND energy <= 10),
  mood INTEGER CHECK (mood >= 1 AND mood <= 10),
  clarity INTEGER CHECK (clarity >= 1 AND clarity <= 10),
  connection INTEGER CHECK (connection >= 1 AND connection <= 10),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_frequency_logs_user ON frequency_logs(user_id, log_date);
CREATE INDEX idx_frequency_logs_session ON frequency_logs(session_id, log_date);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_price_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'paused', 'incomplete')),
  plan VARCHAR(20) CHECK (plan IN ('premium', 'ultimate')),
  billing_interval VARCHAR(20) CHECK (billing_interval IN ('weekly', 'monthly', 'yearly')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE UNIQUE INDEX idx_subscriptions_user ON subscriptions(user_id);

-- Webhook events
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  processed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_webhook_events_stripe ON webhook_events(stripe_event_id);

-- Sessions table (for express-session)
CREATE TABLE sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX idx_sessions_expire ON sessions(expire);
```

### 5.2 IndexedDB Schema (Local Storage)

```typescript
// Database name: SoulCodexDB
// Version: 1

const dbSchema = {
  name: 'SoulCodexDB',
  version: 1,
  stores: [
    {
      name: 'profiles',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId', unique: false },
        { name: 'sessionId', keyPath: 'sessionId', unique: false }
      ]
    },
    {
      name: 'chartResults',
      keyPath: 'id',
      indexes: [
        { name: 'profileId', keyPath: 'profileId', unique: true }
      ]
    },
    {
      name: 'assessments',
      keyPath: 'id',
      indexes: [
        { name: 'profileId_type', keyPath: ['profileId', 'type'], unique: true }
      ]
    },
    {
      name: 'persons',
      keyPath: 'id',
      indexes: [
        { name: 'ownerProfileId', keyPath: 'ownerProfileId', unique: false }
      ]
    },
    {
      name: 'compatibilities',
      keyPath: 'id',
      indexes: [
        { name: 'profile1Id', keyPath: 'profile1Id', unique: false },
        { name: 'profile2Id', keyPath: 'profile2Id', unique: false },
        { name: 'pair', keyPath: ['profile1Id', 'profile2Id'], unique: true }
      ]
    },
    {
      name: 'journalEntries',
      keyPath: 'id',
      indexes: [
        { name: 'profileId', keyPath: 'profileId', unique: false },
        { name: 'entryDate', keyPath: 'entryDate', unique: false },
        { name: 'profileId_date', keyPath: ['profileId', 'entryDate'], unique: false }
      ]
    },
    {
      name: 'dailyInsights',
      keyPath: 'id',
      indexes: [
        { name: 'profileId', keyPath: 'profileId', unique: false },
        { name: 'insightDate', keyPath: 'insightDate', unique: false },
        { name: 'profileId_date', keyPath: ['profileId', 'insightDate'], unique: true }
      ]
    },
    {
      name: 'syncQueue',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        { name: 'synced', keyPath: 'synced', unique: false }
      ]
    },
    {
      name: 'metadata',
      keyPath: 'key'
    }
  ]
};
```

---

## 6. Data Flow

### 6.1 Profile Creation Flow

```
User Input (Birth Data)
    │
    ├─► Store in IndexedDB (profiles table)
    │
    ├─► Calculate Chart (client-side)
    │   └─► Store in IndexedDB (chartResults table)
    │
    ├─► If logged in:
    │   ├─► Add to Sync Queue
    │   └─► Background sync to PostgreSQL
    │
    └─► Render UI with results
```

### 6.2 Compatibility Analysis Flow

```
User adds Person
    │
    ├─► Store Person in IndexedDB (persons table)
    │
    ├─► Calculate Compatibility (client-side)
    │   ├─► Fetch both profiles
    │   ├─► Run compatibility algorithm
    │   └─► Generate scores & insights
    │
    ├─► Store in IndexedDB (compatibilities table)
    │
    ├─► If logged in:
    │   ├─► Add to Sync Queue
    │   └─► Background sync to PostgreSQL
    │
    └─► Render Compatibility Report
```

### 6.3 Daily Insight Generation Flow

```
Scheduled Task (daily, 12:00 AM user time)
    │
    ├─► For each profile:
    │   │
    │   ├─► Calculate current transits
    │   ├─► Calculate personal day number
    │   ├─► Select template (avoid recent repeats)
    │   ├─► Generate personalized content
    │   │   ├─► If AI enabled: OpenAI API
    │   │   └─► Else: Template-based
    │   │
    │   └─► Store in IndexedDB (dailyInsights table)
    │
    ├─► Send push notification (if enabled)
    │
    └─► If logged in: Sync to PostgreSQL
```

---

## 7. Sync Strategy

### 7.1 Offline-First Principles

**Write Flow:**
1. User makes change (e.g., creates profile)
2. Save to IndexedDB immediately → UI updates
3. Add change to sync queue with timestamp
4. Background process syncs when online
5. On sync success, mark as synced in queue
6. On sync failure, retry with exponential backoff

**Read Flow:**
1. Always read from IndexedDB first
2. If online, background fetch updates from server
3. Merge updates using conflict resolution
4. Update IndexedDB with merged data
5. Notify UI of changes (React state update)

### 7.2 Sync Queue Structure

```typescript
interface SyncQueueItem {
  id: string; // UUID
  timestamp: number; // Unix timestamp
  operation: 'create' | 'update' | 'delete';
  entity: 'profile' | 'person' | 'compatibility' | 'journal' | 'assessment';
  entityId: string; // ID of the entity
  data: any; // Entity data
  synced: boolean;
  retryCount: number;
  lastError?: string;
}
```

### 7.3 Conflict Resolution

**Strategy: Last-Write-Wins with Version Tracking**

```typescript
function resolveConflict(local: Entity, remote: Entity): Entity {
  // If versions match, no conflict
  if (local.version === remote.version) {
    return local.updatedAt > remote.updatedAt ? local : remote;
  }
  
  // If local is newer version, keep local
  if (local.version > remote.version) {
    return local;
  }
  
  // If remote is newer version, take remote
  if (remote.version > local.version) {
    return remote;
  }
  
  // If same version but different data, use timestamp
  return local.updatedAt > remote.updatedAt ? local : remote;
}
```

**User Override:**
- If conflict detected, show user both versions
- Let user choose or manually merge
- Rare case: only on simultaneous edits from multiple devices

### 7.4 Sync Triggers

**Automatic:**
- App opened (check for updates)
- Network reconnection (background sync)
- Periodic (every 6 hours if app open)

**Manual:**
- User taps "Sync Now" in settings
- Before critical operations (export, delete account)

### 7.5 Sync Status Indicators

```
🔵 Syncing... (active sync in progress)
✅ Synced (all changes synced)
⚠️ Sync pending (offline, changes waiting)
❌ Sync error (show error, retry button)
```

---

## 8. Data Migrations

### 8.1 Anonymous to Authenticated Migration

When user creates account:

```sql
-- Step 1: Update profile ownership
UPDATE user_profiles
SET user_id = $1, session_id = NULL
WHERE session_id = $2;

-- Step 2: Migrate person profiles
UPDATE person_profiles
SET session_id = NULL
WHERE owner_profile_id IN (
  SELECT id FROM user_profiles WHERE user_id = $1
);

-- Step 3: Migrate compatibilities
UPDATE compatibility_analyses
SET session_id = NULL
WHERE profile1_id IN (
  SELECT id FROM user_profiles WHERE user_id = $1
);

-- Step 4: Migrate journal entries
UPDATE journal_entries
SET session_id = NULL
WHERE profile_id IN (
  SELECT id FROM user_profiles WHERE user_id = $1
);

-- Step 5: Migrate access code redemptions
UPDATE access_code_redemptions
SET user_id = $1, session_id = NULL
WHERE session_id = $2;

-- Step 6: Migrate push subscriptions
UPDATE push_subscriptions
SET user_id = $1, session_id = NULL
WHERE session_id = $2;

-- Step 7: Migrate frequency logs
UPDATE frequency_logs
SET user_id = $1, session_id = NULL
WHERE session_id = $2;
```

### 8.2 Schema Version Migrations

**Version tracking:**
- Store current schema version in metadata table
- Run migrations sequentially on app update
- Both PostgreSQL and IndexedDB migrations

**Example: Adding new field**

```sql
-- PostgreSQL migration
ALTER TABLE user_profiles
ADD COLUMN new_field VARCHAR(100);

-- Update schema version
UPDATE metadata SET value = '2' WHERE key = 'schema_version';
```

```typescript
// IndexedDB migration
async function migrateToV2(db: IDBDatabase) {
  const tx = db.transaction(['profiles'], 'readwrite');
  const store = tx.objectStore('profiles');
  const allProfiles = await store.getAll();
  
  for (const profile of allProfiles) {
    profile.newField = null; // Add new field
    await store.put(profile);
  }
}
```

---

## 9. Security & Privacy

### 9.1 Data Encryption

**In Transit:**
- HTTPS/TLS 1.3 for all API calls
- Certificate pinning for API
- No unencrypted data transmission

**At Rest:**
- IndexedDB: Browser-level encryption (OS-dependent)
- PostgreSQL: Encryption at rest (Neon/Supabase default)
- Stripe: Handles all payment data (PCI compliant)

**Sensitive Fields:**
- Passwords: Argon2 hashing (never stored plaintext)
- API keys: Environment variables, never in code
- Push subscription keys: Encrypted in database

### 9.2 Access Control

**Anonymous Users:**
- Can use all features except cloud sync
- Data tied to browser session
- No cross-device access

**Authenticated Users:**
- Row-level security (RLS) in PostgreSQL
- Users can only access their own data
- API validates user ID from session token

**Premium Users:**
- Additional features unlocked
- Entitlement checked on each request
- Grace period after subscription ends (7 days)

### 9.3 Data Privacy

**Minimal Collection:**
- Only collect data necessary for features
- No tracking without consent
- Anonymous usage by default

**User Rights (GDPR/CCPA):**
- Right to access: Export all data as JSON/PDF
- Right to deletion: Complete data removal
- Right to portability: Standard format export
- Right to rectification: Edit any data

**Data Retention:**
- Active users: Indefinite
- Deleted accounts: 30-day grace period, then permanent deletion
- Anonymous users: Data cleared on session end (unless saved)

### 9.4 Audit Logging

**Sensitive Operations Logged:**
- Account creation/deletion
- Password changes
- Subscription changes
- Data exports
- Access code redemptions

**Log Structure:**
```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata: any;
}
```

---

## 10. Performance Considerations

### 10.1 Indexing Strategy

**PostgreSQL:**
- Primary keys on all `id` fields
- Foreign key indexes for joins
- Composite indexes for common queries
- JSONB GIN indexes for JSON fields
- Full-text indexes for search

**IndexedDB:**
- Indexes on foreign keys
- Composite indexes for date ranges
- Avoid over-indexing (storage cost)

### 10.2 Query Optimization

**Pagination:**
- Limit results to 20-50 per page
- Cursor-based pagination for large datasets
- Offset pagination for small datasets

**Lazy Loading:**
- Load detailed data on demand
- Summary views use minimal fields
- Full data fetched on detail view

**Caching:**
- Cache calculated results (chart, compatibility)
- Invalidate on data change
- Service worker cache for API responses

### 10.3 Data Denormalization

**When to Denormalize:**
- Frequently accessed data
- Complex joins slowing queries
- Read-heavy, write-light data

**Examples:**
- Store calculated scores directly in compatibility table
- Cache chart summary in person profile
- Duplicate user name in journal entries

### 10.4 Storage Limits

**IndexedDB:**
- Browser-dependent (50MB-5GB)
- Monitor usage, warn at 80% capacity
- Prompt to sync and clear local data

**PostgreSQL:**
- Monitor database size
- Archive old data (>2 years)
- Compress JSONB fields

---

## 11. Testing & Validation

### 11.1 Data Integrity

**Constraints:**
- NOT NULL on required fields
- CHECK constraints on enums and ranges
- UNIQUE constraints on natural keys
- Foreign key constraints with CASCADE

**Validation:**
- Input validation at API layer (Zod schemas)
- Database-level constraints
- Client-side validation for UX

### 11.2 Test Data

**Fixtures:**
- Sample profiles for development
- Known compatibility results
- Edge cases (no birth time, missing location)

**Synthetic Data:**
- Generate realistic test profiles
- Anonymized real data for testing
- Performance testing with 10K+ records

---

## 12. Backup & Recovery

### 12.1 Backup Strategy

**PostgreSQL:**
- Automated daily backups (Neon/Supabase)
- Point-in-time recovery (last 7 days)
- Manual backup before major migrations

**IndexedDB:**
- Export to JSON on demand
- Automatic cloud backup (if logged in)
- No automatic local backup (user device storage)

### 12.2 Disaster Recovery

**Database Corruption:**
- Restore from latest backup
- Replay sync queue if possible
- Notify affected users

**Data Loss:**
- User can re-enter birth data
- Recalculate charts automatically
- Journal entries: critical to preserve

---

## Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 27, 2025 | Data Team | Initial comprehensive data model |

---

*This data model is designed to support offline-first architecture with optional cloud sync, prioritizing user privacy and data ownership.*
