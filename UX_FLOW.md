# Soul Codex: UX Flow & Screen Specifications

**Version:** 1.0  
**Date:** December 27, 2025  
**Product:** Soul Codex - Personality & Compatibility App  
**Platform:** Mobile-First Progressive Web App

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Information Architecture](#2-information-architecture)
3. [User Flows](#3-user-flows)
4. [Screen Specifications](#4-screen-specifications)
5. [Component Library](#5-component-library)
6. [Interaction Patterns](#6-interaction-patterns)
7. [Responsive Behavior](#7-responsive-behavior)
8. [Accessibility Guidelines](#8-accessibility-guidelines)

---

## 1. Design Principles

### 1.1 Core UX Principles

**Mobile-First**
- Design for thumb-reach zones
- Touch targets minimum 44x44px
- Bottom navigation for primary actions
- Swipe gestures for common actions

**Progressive Disclosure**
- Show essential information first
- Expandable sections for details
- Clear visual hierarchy
- Minimal cognitive load per screen

**Clarity Over Cleverness**
- Plain language, no mystical jargon
- Clear labels and CTAs
- Obvious next actions
- No ambiguous icons

**Empowering, Not Overwhelming**
- Celebrate user progress
- Positive framing
- Break complex tasks into steps
- Always provide context

**Fast and Responsive**
- Instant feedback on interactions
- Optimistic UI updates
- Loading states with progress
- Offline-capable

### 1.2 Visual Design System

**Color Palette:**
- Primary: Purple (#7c3aed) - Mystical yet modern
- Secondary: Deep Blue (#1e40af) - Trust and depth
- Accent: Gold (#f59e0b) - Insights and highlights
- Success: Green (#10b981)
- Warning: Orange (#f97316)
- Error: Red (#ef4444)
- Background: Dark (#0a0118) with gradient overlays
- Text: White/Gray scale for readability

**Typography:**
- Headings: Plus Jakarta Sans (bold, modern)
- Body: Inter (readable, web-optimized)
- Accent: Space Grotesk (unique personality)
- Code/Data: JetBrains Mono (technical elements)

**Spacing:**
- Base unit: 4px
- Common spacing: 8px, 12px, 16px, 24px, 32px, 48px
- Consistent padding and margins

**Elevation:**
- Cards: subtle shadow, frosted glass effect
- Modals: strong shadow, dark overlay
- Floating actions: pronounced shadow

---

## 2. Information Architecture

### 2.1 Navigation Structure

```
Soul Codex App
│
├─ Onboarding Flow (first-time only)
│  ├─ Welcome Screen
│  ├─ Birth Data Entry
│  ├─ Personality Questionnaire
│  ├─ Profile Processing
│  └─ Results Preview
│
├─ Main App (Bottom Navigation)
│  │
│  ├─ Home Tab 🏠
│  │  ├─ Daily Insight Card
│  │  ├─ Quick Stats
│  │  ├─ Recent Activity
│  │  └─ Quick Actions
│  │
│  ├─ My Profile Tab 👤
│  │  ├─ Profile Header
│  │  ├─ Overview Section
│  │  ├─ Astrology Section
│  │  ├─ Numerology Section
│  │  ├─ Human Design Section
│  │  ├─ Personality Section
│  │  └─ Integration Section
│  │
│  ├─ Compatibility Tab 💕
│  │  ├─ People List
│  │  ├─ Add Person Flow
│  │  ├─ Compatibility Detail View
│  │  └─ Comparison View
│  │
│  ├─ Insights Tab ✨
│  │  ├─ Daily Forecast
│  │  ├─ Weekly Overview
│  │  ├─ Journal Entries
│  │  └─ Reflection Prompts
│  │
│  └─ Settings Tab ⚙️
│     ├─ Account Settings
│     ├─ Notifications
│     ├─ Data Management
│     ├─ Subscription
│     └─ Help & Support
│
├─ Modals & Overlays
│  ├─ Edit Profile
│  ├─ Add Person
│  ├─ Export Options
│  ├─ Share Options
│  ├─ Premium Upsell
│  └─ Help/Tutorial
│
└─ System Screens
   ├─ Loading States
   ├─ Error States
   ├─ Empty States
   └─ Success Confirmations
```

### 2.2 Screen Hierarchy

**Level 1: Entry Points**
- Onboarding (first launch)
- Main Dashboard (returning users)

**Level 2: Primary Navigation**
- Home, My Profile, Compatibility, Insights, Settings

**Level 3: Detail Views**
- Full profile sections, Compatibility reports, Journal detail

**Level 4: Editing & Actions**
- Edit forms, Export options, Share modals

---

## 3. User Flows

### 3.1 First-Time User Flow (Onboarding)

**Goal:** Create user's first profile in under 3 minutes

```
┌─────────────────┐
│  App Launch     │
│  (First Time)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Welcome Screen │ ◄── Skip option (creates basic profile)
│  - Value props  │
│  - Privacy note │
│  - [Get Started]│
└────────┬────────┘
         │ Tap "Get Started"
         ▼
┌─────────────────┐
│ Birth Data Form │
│  - Date picker  │ ◄── "Why?" info icon
│  - Time picker  │     explains accuracy
│  - Location     │
│  - [Continue]   │
└────────┬────────┘
         │ Valid data entered
         ▼
┌─────────────────┐
│  Personality    │
│  Questionnaire  │ ◄── Progress: 1/10, 2/10, etc.
│  (10 questions) │     Skip option available
│  - [Next] after │
│    each question│
└────────┬────────┘
         │ Completed or skipped
         ▼
┌─────────────────┐
│   Processing    │
│   Loading       │ ◄── Fun facts while calculating
│   "Calculating  │     "Did you know...?"
│    your chart"  │     Progress spinner
└────────┬────────┘
         │ Calculations complete (5-15 sec)
         ▼
┌─────────────────┐
│  Welcome to     │
│  Your Profile!  │
│  - Key insights │
│  - [View Full   │
│     Profile]    │
│  - [Add Someone │
│     for Compat] │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Main Dashboard │
│  (Home Tab)     │
└─────────────────┘
```

**Error Handling:**
- Invalid birth date → Inline error message, suggest format
- Location not found → Manual entry option
- Calculation failure → Retry button, fallback to basic profile

**Exit Points:**
- Skip button → Creates basic profile with date only
- Back button → Returns to previous step (data saved)
- Close app → Progress saved, resume on reopen

---

### 3.2 Create Profile Flow (Returning User)

**Goal:** Quick profile creation for existing users

```
┌─────────────────┐
│  Home Dashboard │
│  or Settings    │
└────────┬────────┘
         │ Tap "Edit Profile"
         ▼
┌─────────────────┐
│  Edit Profile   │
│  Modal/Screen   │
│  - Update birth │
│    data         │
│  - Retake tests │
│  - Add photo    │
│  - [Save]       │
└────────┬────────┘
         │ Tap Save
         ▼
┌─────────────────┐
│  Recalculating  │
│  (if data       │
│   changed)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Profile Updated│
│  Success Toast  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Updated Profile│
│  View           │
└─────────────────┘
```

---

### 3.3 Compatibility Analysis Flow

**Goal:** Add person and view compatibility in under 2 minutes

```
┌─────────────────┐
│  Compatibility  │
│  Tab            │
│  (People List)  │
└────────┬────────┘
         │ Tap "+" or "Add Person"
         ▼
┌─────────────────┐
│  Add Person     │
│  Modal          │
│  - Name         │ ◄── Quick add or Detailed add tabs
│  - Birth data   │
│  - Relationship │
│    type         │
│  - [Calculate]  │
└────────┬────────┘
         │ Valid data + Calculate
         ▼
┌─────────────────┐
│  Calculating    │
│  Compatibility  │ ◄── "Analyzing patterns..."
│  Loading        │     Progress indicator
└────────┬────────┘
         │ Complete (10-20 sec)
         ▼
┌─────────────────┐
│  Compatibility  │
│  Dashboard      │
│  - Score gauge  │ ◄── Scroll for more
│  - Pillars      │
│  - Insights     │
│  - [Export]     │
│  - [Add Notes]  │
└────────┬────────┘
         │ Multiple options:
         ├─────► Export PDF
         ├─────► Share link
         ├─────► Add notes
         └─────► View detailed sections
                 │
                 ▼
         ┌─────────────────┐
         │  Detail Sections│
         │  - Chemistry    │
         │  - Communication│
         │  - Lifestyle    │
         │  - Long-term    │
         │  - Synastry     │
         │    chart        │
         └─────────────────┘
```

**Premium Gating:**
- Free users: See basic score + 3 pillars
- Premium prompt: "Unlock detailed insights" for other pillars
- Graceful degradation: Show what's available, hint at more

---

### 3.4 Dashboard Navigation Flow

**Goal:** Easy access to all features from Home

```
┌─────────────────────────────────────┐
│          Home Dashboard             │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Daily Insight Card           │ │ ◄── Tap to expand
│  │  "With Mars in your..."       │ │
│  └───────────────────────────────┘ │
│                                     │
│  Quick Stats:                       │
│  ⭐ Profile 85% complete            │ ◄── Tap to edit profile
│  💕 3 compatibility analyses        │ ◄── Tap to view list
│  📓 12 journal entries              │ ◄── Tap to open journal
│                                     │
│  Recent Activity:                   │
│  - Analyzed compatibility with...  │ ◄── Tap to view report
│  - Updated birth time              │
│  - Exported profile PDF            │
│                                     │
│  Quick Actions:                     │
│  [➕ Add Person] [📄 View Report]  │
│  [📤 Export] [✏️ Journal]          │
│                                     │
└─────────────────────────────────────┘
         │
         ├─ Bottom Nav: Home 🏠 (current)
         ├─ Bottom Nav: Profile 👤
         ├─ Bottom Nav: Compatibility 💕
         ├─ Bottom Nav: Insights ✨
         └─ Bottom Nav: Settings ⚙️
```

---

### 3.5 Export & Share Flow

**Goal:** Export profile or compatibility as PDF or shareable link

```
┌─────────────────┐
│  Profile or     │
│  Compatibility  │
│  View           │
└────────┬────────┘
         │ Tap "Export" or "Share" button
         ▼
┌─────────────────┐
│  Export Options │
│  Bottom Sheet   │
│                 │
│  📄 Export PDF  │ ◄── Tap to see PDF options
│  🔗 Share Link  │ ◄── Tap to see share options
│  📱 Share Image │ ◄── Social media card
│  ❌ Cancel      │
└────────┬────────┘
         │
         ├─ If "Export PDF":
         │  ▼
         │  ┌─────────────────┐
         │  │  PDF Template   │
         │  │  Selector       │
         │  │                 │
         │  │  ○ Comprehensive│ ◄── Premium only
         │  │  ● Summary      │
         │  │  ○ Compatibility│
         │  │                 │
         │  │  [Generate PDF] │
         │  └────────┬────────┘
         │           │
         │           ▼
         │  ┌─────────────────┐
         │  │  Generating...  │
         │  │  Progress bar   │
         │  └────────┬────────┘
         │           │
         │           ▼
         │  ┌─────────────────┐
         │  │  PDF Ready!     │
         │  │  [Download]     │
         │  │  [Email]        │
         │  │  [Share]        │
         │  └─────────────────┘
         │
         ├─ If "Share Link":
         │  ▼
         │  ┌─────────────────┐
         │  │  Link Settings  │
         │  │                 │
         │  │  Privacy:       │
         │  │  ○ Public       │
         │  │  ● Password     │
         │  │                 │
         │  │  Expires:       │
         │  │  ● 1 week       │
         │  │  ○ Never        │
         │  │                 │
         │  │  Sections:      │
         │  │  ☑ Overview     │
         │  │  ☑ Astrology    │
         │  │  ☐ Numerology   │
         │  │                 │
         │  │  [Create Link]  │
         │  └────────┬────────┘
         │           │
         │           ▼
         │  ┌─────────────────┐
         │  │  Link Created!  │
         │  │  soulcodex.app/ │
         │  │  /share/abc123  │
         │  │                 │
         │  │  [Copy Link]    │
         │  │  [Share via...] │
         │  └─────────────────┘
         │
         └─ If "Share Image":
            ▼
            ┌─────────────────┐
            │  Image Preview  │
            │  (1200x630px)   │
            │  Social card    │
            │                 │
            │  [Download]     │
            │  [Share]        │
            └─────────────────┘
```

---

### 3.6 Journal & Insights Flow

**Goal:** Daily engagement through prompts and reflection

```
┌─────────────────┐
│  Insights Tab   │
│  Dashboard      │
└────────┬────────┘
         │
         ├─ Today's Forecast
         │  ▼
         │  ┌─────────────────┐
         │  │  Daily Insight  │
         │  │  Detailed View  │
         │  │                 │
         │  │  - Current      │
         │  │    transits     │
         │  │  - Numerology   │
         │  │    day          │
         │  │  - Intention    │
         │  │  - Affirmation  │
         │  │                 │
         │  │  [Journal       │
         │  │   About This]   │
         │  └─────────────────┘
         │
         ├─ Reflection Prompt
         │  ▼
         │  ┌─────────────────┐
         │  │  Today's Prompt │
         │  │  "With Mars..." │
         │  │                 │
         │  │  [Start Writing]│
         │  └────────┬────────┘
         │           │ Tap to write
         │           ▼
         │  ┌─────────────────┐
         │  │  Journal Editor │
         │  │                 │
         │  │  ┌────────────┐ │
         │  │  │ Text area  │ │ ◄── Auto-save
         │  │  │            │ │     every 3 sec
         │  │  │            │ │
         │  │  └────────────┘ │
         │  │                 │
         │  │  Mood: 😊 😐 😢 │
         │  │  Tags: [+Add]   │
         │  │                 │
         │  │  [Done] [Cancel]│
         │  └────────┬────────┘
         │           │ Tap Done
         │           ▼
         │  ┌─────────────────┐
         │  │  Entry Saved!   │
         │  │  ✓ Success      │
         │  └─────────────────┘
         │
         └─ Journal History
            ▼
            ┌─────────────────┐
            │  All Entries    │
            │                 │
            │  🔍 Search bar  │
            │                 │
            │  Filter:        │
            │  [All] [Mood]   │
            │  [Tags] [Date]  │
            │                 │
            │  Entry list:    │
            │  📅 Dec 27      │ ◄── Tap to view/edit
            │  "Today I..."   │
            │  😊 #growth     │
            │                 │
            │  📅 Dec 26      │
            │  "Feeling..."   │
            │  😐 #reflection │
            │                 │
            └─────────────────┘
```

---

### 3.7 Premium Upgrade Flow

**Goal:** Convert free users to premium with clear value

```
┌─────────────────┐
│  Free User      │
│  Encounters     │
│  Locked Feature │
└────────┬────────┘
         │ Tap on premium feature
         ▼
┌─────────────────┐
│  Premium Prompt │
│  Modal          │
│                 │
│  🔒 Unlock:     │
│  "Detailed      │
│   Synastry"     │
│                 │
│  Premium gives  │
│  you:           │
│  ✓ Item 1       │
│  ✓ Item 2       │
│  ✓ Item 3       │
│                 │
│  [See Plans]    │
│  [Maybe Later]  │
└────────┬────────┘
         │ Tap "See Plans"
         ▼
┌─────────────────┐
│  Pricing Page   │
│                 │
│  ┌─────────────┐│
│  │ Free Tier   ││ ◄── Comparison
│  │ (Current)   ││     table
│  └─────────────┘│
│                 │
│  ┌─────────────┐│
│  │ Premium     ││ ◄── Highlighted
│  │ $9.99/mo    ││     recommended
│  │ [Start      ││
│  │  Trial]     ││
│  └─────────────┘│
│                 │
│  ┌─────────────┐│
│  │ Ultimate    ││
│  │ $19.99/mo   ││
│  │ [Select]    ││
│  └─────────────┘│
│                 │
│  7-day free     │
│  trial!         │
│                 │
└────────┬────────┘
         │ Tap "Start Trial" or "Select"
         ▼
┌─────────────────┐
│  Payment Flow   │
│  (Stripe)       │
│                 │
│  - Email        │
│  - Card info    │
│  - [Subscribe]  │
└────────┬────────┘
         │ Payment successful
         ▼
┌─────────────────┐
│  Welcome to     │
│  Premium! 🎉    │
│                 │
│  Your trial     │
│  starts now.    │
│                 │
│  [Explore       │
│   Features]     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return to      │
│  Original       │
│  Context        │
│  (Now unlocked) │
└─────────────────┘
```

**Conversion Triggers:**
- Locked feature tap (in-context upsell)
- After 3rd compatibility analysis (usage milestone)
- After 7 days of daily use (engagement milestone)
- Settings → Subscription tab (direct access)

---

## 4. Screen Specifications

### 4.1 Onboarding Screens

#### Screen 1: Welcome

**Layout:**
```
┌───────────────────────────┐
│      [Skip] ───────────── │
│                           │
│         🌟 ✨            │
│     Soul Codex Logo       │
│                           │
│   Understand Yourself     │
│   & Your Relationships    │
│                           │
│  • Multi-system analysis  │
│  • Clear, actionable      │
│    insights               │
│  • Your data, your        │
│    control                │
│                           │
│                           │
│   ┌───────────────────┐   │
│   │   Get Started     │   │ ◄── Primary CTA
│   └───────────────────┘   │
│                           │
│  By continuing, you agree │
│  to Terms & Privacy       │ ◄── Links
│                           │
└───────────────────────────┘
```

**Interactions:**
- Tap "Get Started" → Birth Data screen
- Tap "Skip" → Basic profile creation, go to dashboard
- Tap "Terms" / "Privacy" → Open in modal

**Animations:**
- Logo fade-in + scale
- Text fade-in stagger
- Button pulse (subtle)

---

#### Screen 2: Birth Data Entry

**Layout:**
```
┌───────────────────────────┐
│  [← Back]    Step 1/3     │
│                           │
│   Tell Us About You       │
│                           │
│  Birth Date: *            │
│  ┌───────────────────┐    │
│  │  MM / DD / YYYY   │    │ ◄── Date picker
│  └───────────────────┘    │
│                           │
│  Birth Time: (optional)   │
│  ┌───────────────────┐    │
│  │  HH : MM  AM/PM   │    │ ◄── Time picker
│  └───────────────────┘    │
│  ⓘ Time improves accuracy │
│     by 40%                │
│                           │
│  Birth Location: *        │
│  ┌───────────────────┐    │
│  │  🔍 Search city... │   │ ◄── Autocomplete
│  └───────────────────┘    │
│  ⓘ For precise chart      │
│     calculations          │
│                           │
│   ┌───────────────────┐   │
│   │     Continue      │   │ ◄── Enabled when valid
│   └───────────────────┘   │
│                           │
└───────────────────────────┘
```

**Validation:**
- Birth date: Must be past date, reasonable age (1900-today)
- Birth time: Optional, 12/24 hour format
- Location: Must resolve to coordinates (Google Places API)

**Error States:**
- Inline error messages below fields
- Red border on invalid field
- Clear, helpful error text

**Interactions:**
- Tap field → Open native picker (date/time)
- Type in location → Show autocomplete dropdown
- Tap ⓘ icon → Tooltip explaining why field matters
- Tap "Continue" → Validation, then next screen

---

#### Screen 3: Personality Questionnaire

**Layout (per question):**
```
┌───────────────────────────┐
│  [← Back]    3/10    [Skip]│
│                           │
│  Question 3:              │
│                           │
│  "In social situations,   │
│   do you prefer..."       │
│                           │
│   ┌─────────────────────┐ │
│   │ ○ Option A:         │ │ ◄── Radio buttons
│   │   "Large groups..."  │ │
│   └─────────────────────┘ │
│                           │
│   ┌─────────────────────┐ │
│   │ ○ Option B:         │ │
│   │   "One-on-one..."    │ │
│   └─────────────────────┘ │
│                           │
│   ┌─────────────────────┐ │
│   │ ○ Option C:         │ │
│   │   "Depends on..."    │ │
│   └─────────────────────┘ │
│                           │
│                           │
│   ┌───────────────────┐   │
│   │      Next         │   │ ◄── Auto-enabled on select
│   └───────────────────┘   │
│                           │
│  [●●●○○○○○○○] Progress    │
└───────────────────────────┘
```

**Question Types:**
- Multiple choice (3-4 options)
- Sliding scale (1-5 or 1-10)
- Yes/No
- Ranking (drag to order)

**Interactions:**
- Tap option → Select (radio highlight)
- Tap "Next" → Next question or completion
- Tap "Skip" → Skip to processing
- Swipe left → Next question (if answered)
- Swipe right → Previous question

**Progress:**
- Bar at bottom showing X/10
- Smooth animation on completion

---

#### Screen 4: Processing

**Layout:**
```
┌───────────────────────────┐
│                           │
│         ✨ 🌟 ✨          │
│                           │
│   Calculating Your Chart  │
│                           │
│   ┌─────────────────────┐ │
│   │   [Spinner/Loader]  │ │ ◄── Animated
│   └─────────────────────┘ │
│                           │
│  Analyzing patterns...    │
│  • Planetary positions ✓  │ ◄── Check marks appear
│  • Numerology cycles ✓    │     as calculations
│  • Personality synthesis  │     complete
│                           │
│  ──────────────────────   │
│                           │
│  💡 Did you know?         │
│  "Your birth chart is a   │ ◄── Rotating fun facts
│   snapshot of the sky at  │
│   the moment you were     │
│   born."                  │
│                           │
└───────────────────────────┘
```

**Behavior:**
- Auto-advance to Results when complete
- Show progress through checklist
- Rotate fun facts every 3 seconds
- Estimated time: 5-15 seconds

**Error Handling:**
- If calculation fails → Show error + Retry button
- Timeout after 30 seconds → Fallback to basic profile

---

#### Screen 5: Results Preview

**Layout:**
```
┌───────────────────────────┐
│          ✨ 🎉 ✨         │
│                           │
│   Welcome, [Name]! 👋     │
│                           │
│  Your Soul Codex Profile  │
│  is ready.                │
│                           │
│  Key Highlights:          │
│                           │
│  ┌─────────────────────┐  │
│  │ ☀️ Sun: Capricorn   │  │ ◄── Card format
│  │   Determined, goal   │  │
│  │   -oriented          │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 🔢 Life Path: 7     │  │
│  │   Seeker, analyst    │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 🧬 HD: Generator    │  │
│  │   Powerful energy    │  │
│  └─────────────────────┘  │
│                           │
│   ┌───────────────────┐   │
│   │  View Full Profile│   │ ◄── Primary CTA
│   └───────────────────┘   │
│                           │
│   ┌───────────────────┐   │
│   │  Add Someone for  │   │ ◄── Secondary CTA
│   │  Compatibility    │   │
│   └───────────────────┘   │
│                           │
└───────────────────────────┘
```

**Interactions:**
- Tap "View Full Profile" → Navigate to Profile tab
- Tap "Add Someone" → Open Add Person modal
- Auto-dismiss after 10 seconds → Navigate to Home

---

### 4.2 Main App Screens

#### Home Tab

**Layout:**
```
┌───────────────────────────┐
│  Soul Codex    [☰ Menu]   │ ◄── Top bar
│  ───────────────────────  │
│                           │
│  ┌─────────────────────┐  │
│  │ ✨ Today's Insight  │  │ ◄── Featured card
│  │                     │  │     (swipeable)
│  │ "With Venus in..."  │  │
│  │                     │  │
│  │ [Read More →]       │  │
│  └─────────────────────┘  │
│                           │
│  Quick Stats              │
│  ┌──────┐ ┌──────┐ ┌────┐│
│  │⭐85% │ │💕 3  │ │📓12││ ◄── Tappable cards
│  │Prof  │ │Compat│ │Jrnl││
│  └──────┘ └──────┘ └────┘│
│                           │
│  Recent Activity          │
│  • Analyzed compatibility │ ◄── List items
│    with Alex (2h ago)    │     (tap to view)
│  • Updated profile (1d)  │
│  • Journaled (3d)        │
│                           │
│  Quick Actions            │
│  ┌──────────┐ ┌─────────┐│
│  │ ➕ Add   │ │ 📄 View ││ ◄── Action buttons
│  │  Person  │ │  Report ││
│  └──────────┘ └─────────┘│
│  ┌──────────┐ ┌─────────┐│
│  │ 📤 Export│ │ ✏️ Write││
│  └──────────┘ └─────────┘│
│                           │
└───────────────────────────┘
│ 🏠  👤  💕  ✨  ⚙️      │ ◄── Bottom nav
└───────────────────────────┘
```

**Key Interactions:**
- Swipe featured card → See different insights
- Tap stats → Navigate to relevant section
- Tap recent activity → Open detail view
- Pull down → Refresh data

---

#### My Profile Tab

**Layout (Scrollable):**
```
┌───────────────────────────┐
│  My Profile    [Edit] [•••]│ ◄── Actions menu
│  ───────────────────────  │
│                           │
│  ┌─────────────────────┐  │
│  │   [Profile Photo]   │  │ ◄── Header card
│  │                     │  │
│  │    [Display Name]   │  │
│  │  Sun ☀️ • Moon 🌙  │  │
│  │  Rising ↗️          │  │
│  │                     │  │
│  │  Profile 85% ████▯  │  │ ◄── Completeness
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 📋 Overview         │  │ ◄── Expandable section
│  │ ─────────────────   │  │
│  │ Your unique blend...│  │
│  │ [Read More ▼]       │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ ♈ Astrology        │  │ ◄── Tap to expand
│  │ ─────────────────   │  │
│  │ Sun, Moon, Rising   │  │
│  │ → [View Details]    │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 🔢 Numerology       │  │
│  │ ─────────────────   │  │
│  │ Life Path 7         │  │
│  │ → [View Details]    │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 🧬 Human Design     │  │
│  │ ─────────────────   │  │
│  │ Generator Type      │  │
│  │ → [View Details] 🔒 │  │ ◄── Premium badge
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 🧠 Personality      │  │
│  │ ─────────────────   │  │
│  │ INFJ • Type 4       │  │
│  │ → [View Details]    │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ ✨ Integration      │  │
│  │ ─────────────────   │  │
│  │ Your unified        │  │
│  │ archetype...        │  │
│  │ → [View Details]    │  │
│  └─────────────────────┘  │
│                           │
│  ┌───────────────────┐    │
│  │  Export Profile   │    │ ◄── Action button
│  └───────────────────┘    │
│                           │
└───────────────────────────┘
│ 🏠  👤  💕  ✨  ⚙️      │
└───────────────────────────┘
```

**Section Expanded State:**
```
┌───────────────────────────┐
│ ♈ Astrology         [▲]  │ ◄── Collapse button
│ ─────────────────────────│
│                           │
│  🌞 Sun in Capricorn      │
│  10th House               │
│  "You are driven by..."   │
│                           │
│  🌙 Moon in Pisces        │
│  12th House               │
│  "Emotionally, you..."    │
│                           │
│  ↗️ Rising: Leo           │
│  "Others see you as..."   │
│                           │
│  [View Full Chart]        │ ◄── Deeplink to detail
│                           │
└───────────────────────────┘
```

**Interactions:**
- Tap section → Expand/collapse
- Tap "View Details" → Full-screen detail view
- Tap [Edit] → Edit profile modal
- Tap [•••] → Actions: Share, Export, Delete
- Swipe left on section → Quick actions

---

#### Compatibility Tab

**Layout (List View):**
```
┌───────────────────────────┐
│  Compatibility  [+ Add]   │
│  ───────────────────────  │
│                           │
│  [🔍 Search people...]    │
│                           │
│  Filter: [All ▼] [Sort ▼] │
│                           │
│  ┌─────────────────────┐  │
│  │ 👤 Alex Thompson    │  │ ◄── Person card
│  │ 💕 Romantic         │  │     (tap to view)
│  │                     │  │
│  │ Overall: 87/100     │  │
│  │ ████████▯▯          │  │
│  │                     │  │
│  │ Strong Match 💪     │  │
│  │ → [View Report]     │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 👤 Jordan Lee       │  │
│  │ 👥 Friend           │  │
│  │                     │  │
│  │ Overall: 72/100     │  │
│  │ ███████▯▯▯          │  │
│  │                     │  │
│  │ Compatible ✓        │  │
│  │ → [View Report]     │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 👤 Sam Rivera       │  │
│  │ 💼 Colleague        │  │
│  │                     │  │
│  │ Overall: 56/100     │  │
│  │ █████▯▯▯▯▯          │  │
│  │                     │  │
│  │ Moderate ⚠️         │  │
│  │ → [View Report]     │  │
│  └─────────────────────┘  │
│                           │
└───────────────────────────┘
│ 🏠  👤  💕  ✨  ⚙️      │
└───────────────────────────┘
```

**Empty State:**
```
┌───────────────────────────┐
│  Compatibility            │
│  ───────────────────────  │
│                           │
│         💕 ✨            │
│                           │
│  Discover Compatibility   │
│                           │
│  Add someone to see how   │
│  your patterns align      │
│  across multiple          │
│  dimensions.              │
│                           │
│   ┌───────────────────┐   │
│   │  Add First Person │   │
│   └───────────────────┘   │
│                           │
└───────────────────────────┘
```

**Interactions:**
- Tap person card → Compatibility detail
- Tap [+ Add] → Add person modal
- Swipe left on card → Quick actions (Edit, Delete)
- Search bar → Filter list
- Pull down → Refresh

---

#### Compatibility Detail View

**Layout (Scrollable):**
```
┌───────────────────────────┐
│ [← Back]  Alex  [•••]     │
│  ───────────────────────  │
│                           │
│  ┌─────────────────────┐  │
│  │     You & Alex      │  │ ◄── Header
│  │   💕 Romantic       │  │
│  │                     │  │
│  │      ┌────────┐     │  │ ◄── Circular gauge
│  │      │   87   │     │  │     (animated)
│  │      │  /100  │     │  │
│  │      └────────┘     │  │
│  │                     │  │
│  │  Strong Match 💪    │  │
│  │                     │  │
│  │ "You share deep     │  │
│  │  emotional          │  │
│  │  understanding..."  │  │
│  └─────────────────────┘  │
│                           │
│  Compatibility Breakdown  │
│                           │
│  ┌─────────────────────┐  │
│  │ 🔥 Attraction       │  │ ◄── Pillar card
│  │ 92/100 ±3          │  │     (expandable)
│  │ █████████▯          │  │
│  │ "Magnetic pull..." │  │
│  │ [▼ More]            │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 💬 Communication    │  │
│  │ 78/100 ±5          │  │
│  │ ████████▯▯          │  │
│  │ "Different styles   │  │
│  │  but workable..."  │  │
│  │ [▼ More]            │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 🏡 Lifestyle        │  │
│  │ 85/100 ±4          │  │
│  │ ████████▯           │  │
│  │ [▼ More]            │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 🌱 Long-Term        │  │
│  │ 89/100 ±3          │  │
│  │ █████████▯          │  │
│  │ [▼ More]            │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ ⏰ Current Timing   │  │
│  │ 72/100 ±6          │  │
│  │ ███████▯▯▯          │  │
│  │ [▼ More]            │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 💓 Emotional        │  │
│  │ 91/100 ±4   🔒     │  │ ◄── Premium locked
│  │ [Unlock Premium]    │  │
│  └─────────────────────┘  │
│                           │
│  Strengths & Challenges   │
│                           │
│  ┌─────────────────────┐  │
│  │ ✅ Strengths        │  │
│  │ • Deep empathy      │  │
│  │ • Shared values     │  │
│  │ • Growth-oriented   │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ ⚠️ Challenges        │  │
│  │ • Communication     │  │
│  │   differences       │  │
│  │ • Conflict styles   │  │
│  └─────────────────────┘  │
│                           │
│  Relationship Advice      │
│  ┌─────────────────────┐  │
│  │ 💡 Tips:            │  │
│  │ 1. Practice active  │  │
│  │    listening        │  │
│  │ 2. Honor each       │  │
│  │    other's...       │  │
│  │ [Read More]         │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ ♈ Synastry Chart🔒 │  │ ◄── Premium feature
│  │ [Unlock to view     │  │
│  │  astrological       │  │
│  │  aspects]           │  │
│  └─────────────────────┘  │
│                           │
│  Actions                  │
│  ┌──────────┐ ┌─────────┐│
│  │📤 Export │ │🔗 Share ││
│  └──────────┘ └─────────┘│
│  ┌──────────┐ ┌─────────┐│
│  │📝 Notes  │ │✏️ Edit  ││
│  └──────────┘ └─────────┘│
│                           │
└───────────────────────────┘
```

**Expanded Pillar:**
```
┌─────────────────────┐
│ 🔥 Attraction  [▲] │ ◄── Collapse
│ 92/100 ±3          │
│ █████████▯          │
│                     │
│ "Your charts show   │
│ strong magnetic     │
│ attraction.         │
│ Venus-Mars aspects  │
│ create chemistry."  │
│                     │
│ Key Factors:        │
│ • Venus conjunct    │
│   Mars (8.5/10)     │
│ • Moon sextile      │
│   Venus (7/10)      │
│ • Ascendant trine   │
│   Sun (6.5/10)      │
│                     │
└─────────────────────┘
```

---

#### Insights Tab

**Layout:**
```
┌───────────────────────────┐
│  Insights      [Calendar] │
│  ───────────────────────  │
│                           │
│  Today • Dec 27, 2025     │
│                           │
│  ┌─────────────────────┐  │
│  │ ✨ Daily Forecast   │  │ ◄── Featured card
│  │                     │  │
│  │ "Moon in Gemini     │  │
│  │  encourages         │  │
│  │  communication..."  │  │
│  │                     │  │
│  │ Current Transits:   │  │
│  │ • Mars → 10th House │  │
│  │ • Venus sextile     │  │
│  │   natal Moon        │  │
│  │                     │  │
│  │ Personal Day: 5     │  │
│  │ (Freedom, change)   │  │
│  │                     │  │
│  │ [Journal About This]│  │
│  └─────────────────────┘  │
│                           │
│  This Week               │
│  ┌─────────────────────┐  │
│  │ 📅 Dec 27 - Jan 2   │  │
│  │                     │  │
│  │ Key themes:         │  │
│  │ • Career focus      │  │
│  │ • Relationship      │  │
│  │   clarity           │  │
│  │                     │  │
│  │ [View Details] 🔒   │  │ ◄── Premium
│  └─────────────────────┘  │
│                           │
│  Recent Journal Entries  │
│  ┌─────────────────────┐  │
│  │ 📓 Dec 27, 9:30 AM  │  │ ◄── Entry card
│  │ "Today I realized..." │  │     (tap to view)
│  │ 😊 #growth          │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 📓 Dec 26, 8:15 PM  │  │
│  │ "Feeling grateful..." │  │
│  │ 😌 #reflection      │  │
│  └─────────────────────┘  │
│                           │
│  ┌───────────────────┐    │
│  │  Start Journaling │    │ ◄── Action button
│  └───────────────────┘    │
│                           │
└───────────────────────────┘
│ 🏠  👤  💕  ✨  ⚙️      │
└───────────────────────────┘
```

---

#### Settings Tab

**Layout:**
```
┌───────────────────────────┐
│  Settings                 │
│  ───────────────────────  │
│                           │
│  Account                  │
│  ┌─────────────────────┐  │
│  │ [Profile Photo]     │  │ ◄── If logged in
│  │ user@email.com      │  │
│  │ → [Manage Account]  │  │
│  └─────────────────────┘  │
│  Or:                      │
│  ┌─────────────────────┐  │
│  │ 🔓 Not signed in    │  │ ◄── If anonymous
│  │ → [Create Account]  │  │
│  │ → [Sign In]         │  │
│  └─────────────────────┘  │
│                           │
│  Subscription             │
│  ┌─────────────────────┐  │
│  │ Current Plan:       │  │
│  │ ⭐ Premium          │  │ ◄── Or Free / Ultimate
│  │ Renews: Jan 15      │  │
│  │ → [Manage]          │  │
│  └─────────────────────┘  │
│                           │
│  Notifications            │
│  ┌─────────────────────┐  │
│  │ Push Notifications  │  │
│  │ [Toggle ON/OFF]     │  │
│  │ → [Configure]       │  │
│  └─────────────────────┘  │
│                           │
│  Data & Privacy           │
│  ┌─────────────────────┐  │
│  │ → Export My Data    │  │
│  │ → Sync Settings     │  │
│  │ → Delete Account    │  │
│  └─────────────────────┘  │
│                           │
│  Preferences              │
│  ┌─────────────────────┐  │
│  │ → Theme (Dark/Light)│  │
│  │ → Language          │  │
│  │ → Units (12/24hr)   │  │
│  └─────────────────────┘  │
│                           │
│  Help & Support           │
│  ┌─────────────────────┐  │
│  │ → Help Center       │  │
│  │ → Contact Support   │  │
│  │ → Report Bug        │  │
│  │ → App Tutorial      │  │
│  └─────────────────────┘  │
│                           │
│  Legal                    │
│  ┌─────────────────────┐  │
│  │ → Terms of Service  │  │
│  │ → Privacy Policy    │  │
│  │ → Licenses          │  │
│  └─────────────────────┘  │
│                           │
│  App version 1.0.0        │
│                           │
└───────────────────────────┘
│ 🏠  👤  💕  ✨  ⚙️      │
└───────────────────────────┘
```

---

## 5. Component Library

### 5.1 Core Components

**Button:**
- Primary: Filled, purple gradient
- Secondary: Outlined, white/gray
- Tertiary: Text only, underline on hover
- Sizes: Small (32px), Medium (44px), Large (56px)
- States: Default, Hover, Active, Disabled, Loading

**Card:**
- Container with subtle shadow
- Frosted glass effect (background blur)
- Rounded corners (12px)
- Padding: 16px or 24px
- Optional: Header, body, footer sections

**Input Fields:**
- Text input, textarea, select, date/time pickers
- Label above field
- Placeholder text (gray)
- Helper text below (smaller font)
- Error state (red border + message)
- Success state (green border + checkmark)

**Progress Indicators:**
- Linear progress bar
- Circular progress (spinner)
- Percentage display
- Skeleton loaders for content

**Navigation:**
- Bottom tab bar (5 items max)
- Icons + labels
- Active state highlighted
- Badge for notifications

**Modal/Dialog:**
- Full-screen overlay (mobile)
- Centered card (tablet/desktop)
- Close button (X) top-right
- Backdrop overlay (dark, 60% opacity)

### 5.2 Domain-Specific Components

**Compatibility Gauge:**
- Circular progress ring
- Score in center (0-100)
- Color-coded:
  - 90-100: Gold
  - 75-89: Green
  - 60-74: Blue
  - 45-59: Orange
  - <45: Red
- Animated on reveal

**Astrology Chart Wheel:**
- SVG-based natal chart
- Interactive (tap signs/planets for info)
- Aspect lines
- Zoom/pan capable

**Pillar Score Card:**
- Pillar name + icon
- Score with error margin (78 ± 5)
- Horizontal bar
- Expand/collapse for details

**Daily Insight Card:**
- Headline
- Body text (3-4 sentences)
- Transit info
- CTA button
- Swipeable carousel

**Journal Entry Card:**
- Date/time stamp
- Preview text (2 lines)
- Mood emoji
- Tags
- Tap to open full editor

---

## 6. Interaction Patterns

### 6.1 Gestures

**Tap:**
- Select item
- Open detail
- Toggle expand/collapse
- Activate button

**Long Press:**
- Context menu (edit, delete, share)
- Quick actions

**Swipe Left:**
- Quick actions on list items (delete, edit)

**Swipe Right:**
- Navigate back (iOS-style)

**Swipe Up/Down:**
- Dismiss modal/sheet
- Scroll content

**Pull Down:**
- Refresh data

**Pinch/Zoom:**
- Zoom charts/images

### 6.2 Animations

**Page Transitions:**
- Slide left/right (navigation)
- Fade in/out (modal open/close)
- Scale up (detail view)

**Element Animations:**
- Fade in + slide up (cards appearing)
- Progress bar fill (smooth, eased)
- Spinner rotation (continuous)
- Button pulse (subtle, on primary CTAs)

**Feedback Animations:**
- Checkmark bounce (success)
- Shake (error)
- Ripple (button press)

**Timing:**
- Fast: 150-200ms (feedback, interactions)
- Medium: 250-350ms (transitions)
- Slow: 500-700ms (page transitions, complex animations)

### 6.3 Loading States

**Initial Load:**
- Splash screen (app logo)
- Skeleton loaders for content

**Action Loading:**
- Button shows spinner, disables
- Inline loader (small spinner)

**Background Loading:**
- Toast notification when complete
- Silent updates (no interruption)

### 6.4 Error Handling

**Inline Errors:**
- Red text below field
- Icon indicator
- Clear, actionable message

**Toast Notifications:**
- Bottom of screen
- Auto-dismiss after 3-5 seconds
- Swipe to dismiss

**Full-Screen Errors:**
- Illustration
- Headline
- Explanation
- Retry button
- Support link

**Offline Mode:**
- Banner at top: "You're offline. Some features unavailable."
- Auto-hide when back online

---

## 7. Responsive Behavior

### 7.1 Breakpoints

- **Mobile:** 320px - 767px (default design target)
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

### 7.2 Mobile (Default)

- Single column layout
- Bottom navigation
- Full-width cards
- Touch-optimized (44px+ targets)

### 7.3 Tablet

- Two-column layout (where appropriate)
- Side navigation (optional)
- Cards in grid (2 columns)
- Larger typography

### 7.4 Desktop

- Three-column layout (sidebar + main + detail)
- Persistent side navigation
- Cards in grid (3 columns)
- Hover states enabled
- Keyboard shortcuts

### 7.5 Responsive Images

- Srcset for multiple resolutions
- Lazy loading
- WebP format with fallback

---

## 8. Accessibility Guidelines

### 8.1 WCAG 2.1 Level AA Compliance

**Perceivable:**
- Text contrast ≥ 4.5:1
- Alternative text for images
- Color not sole indicator
- Resizable text (up to 200%)

**Operable:**
- Keyboard navigation support
- Focus indicators (visible)
- Touch targets ≥ 44x44px
- No time limits (or adjustable)
- Skip navigation links

**Understandable:**
- Clear, simple language
- Consistent navigation
- Error suggestions provided
- Labels for all inputs

**Robust:**
- Valid HTML/ARIA
- Screen reader compatible
- Works across browsers/devices

### 8.2 Implementation

**Semantic HTML:**
- `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`
- `<button>` for clickable actions
- `<a>` for navigation links

**ARIA Labels:**
- `aria-label` for icon-only buttons
- `aria-describedby` for helper text
- `aria-expanded` for expandable sections
- `role` attributes where needed

**Keyboard Navigation:**
- Tab order follows visual order
- Enter/Space to activate
- Escape to close modals
- Arrow keys for lists/carousels

**Screen Reader Support:**
- Announce dynamic changes (`aria-live`)
- Descriptive link text
- Form error announcements
- Loading state announcements

---

## 9. Platform-Specific Considerations

### 9.1 iOS (Safari)

- Safe area insets for notch
- Rubber-band scrolling
- Tap delay (300ms) mitigation
- iOS-style date/time pickers
- Share sheet integration

### 9.2 Android (Chrome)

- Back button behavior
- Material Design patterns
- Android-style pickers
- Drawer navigation (optional)
- Share intent integration

### 9.3 PWA Features

- Install prompt
- Offline fallback page
- Service worker updates
- Background sync
- Push notifications

---

## 10. Performance Optimization

**Lazy Loading:**
- Below-fold content
- Images on scroll
- Route-based code splitting

**Caching:**
- Service worker cache
- API response cache (stale-while-revalidate)
- Image caching

**Optimization:**
- Minified assets
- Compressed images (WebP)
- Tree-shaking unused code
- Font subsetting

**Metrics:**
- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- TTI (Time to Interactive): < 3.5s
- CLS (Cumulative Layout Shift): < 0.1

---

## Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 27, 2025 | UX Team | Initial comprehensive UX flow |

---

*This UX flow document should be used in conjunction with PRD.md and DATA_MODEL.md for complete product specification.*
