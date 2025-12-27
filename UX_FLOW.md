# Soul Codex - UX Flow Documentation

**Version:** 1.0  
**Date:** December 2025  
**Status:** Shippable  

---

## Overview

This document outlines the complete user experience flow for Soul Codex, from first-time onboarding through advanced features. The app is designed mobile-first with touch-optimized interactions and offline capability.

---

## 1. Onboarding Flow

### 1.1 Landing Page (First Visit)

**Screen:** Hero + Value Proposition

**Elements:**
- App logo and name: "Soul Codex"
- Tagline: "Your Complete Soul Blueprint"
- Hero image: Mystical cosmic visualization
- Value props (3 bullets):
  - "Synthesize 30+ personality systems"
  - "Understand yourself and your relationships"
  - "Offline-first, privacy-focused"
- Primary CTA: "Create Your Profile" (purple button, large)
- Secondary CTA: "Explore as Guest" (link)
- Footer: "Learn More" | "Privacy Policy"

**User Actions:**
- Tap "Create Your Profile" → Goes to Profile Creation
- Tap "Explore as Guest" → Goes to Demo Profile (pre-populated example)
- Tap "Learn More" → Scrolls to feature showcase
- Tap "Privacy Policy" → Opens privacy policy modal

**Design Notes:**
- Full viewport height on mobile
- Gradient background (purple to indigo)
- Floating cosmic particles animation
- Bottom sheet on mobile (swipe up for details)

---

### 1.2 Profile Creation (Step 1: Basic Info)

**Screen:** Profile Form - Basic Details

**Elements:**
- Progress indicator: "Step 1 of 3"
- Form fields:
  - **Full Name** (text input, optional)
    - Placeholder: "Optional, but helps personalize insights"
  - **Date of Birth** (date picker, required)
    - Opens mobile-native date picker
    - Validation: Must be between 1900 and current year
  - **Birth Time** (time picker, optional)
    - Toggle: "I don't know my birth time"
    - Help tooltip: "Birth time gives more accurate astrology. If unknown, we'll use noon."
  - **Birth Place** (location search, optional)
    - Autocomplete with city suggestions
    - Displays: "City, Country"
    - Help tooltip: "Needed for accurate chart houses and time zone"
- Primary CTA: "Continue" (disabled until date of birth entered)
- Secondary link: "Skip and use as guest"

**User Actions:**
- Enter birth date → Enables "Continue" button
- Optionally enter name, time, place
- Tap "Continue" → Goes to Profile Creation Step 2
- Tap "Skip and use as guest" → Creates anonymous session profile, goes to Dashboard

**Validation:**
- Date of birth required
- Birth time: UI accepts HH:MM format; stored as TIME (HH:MM:SS) with seconds defaulted to :00 if entered
- Birth place: Must resolve to valid location (geocoding check)

**Design Notes:**
- Large, touch-friendly input fields (44px min height)
- Floating labels for clean look
- Inline validation (green checkmark when valid)
- Keyboard type: numeric for time, text for location

---

### 1.3 Profile Creation (Step 2: Psychology - Optional)

**Screen:** Profile Form - Psychological Profile

**Elements:**
- Progress indicator: "Step 2 of 3"
- Heading: "Help us understand you better (optional)"
- Form fields:
  - **Attachment Style** (radio buttons)
    - Options: Secure, Anxious, Avoidant, Disorganized
    - Help text under each: brief definition
    - "Not sure?" link → Opens attachment style quiz (future)
  - **Love Languages** (multi-select checkboxes)
    - Options: Words of Affirmation, Physical Touch, Gifts, Acts of Service, Quality Time
    - Help text: "Select all that apply"
- Primary CTA: "Continue"
- Secondary link: "Skip for now"

**User Actions:**
- Select attachment style (optional)
- Select love languages (optional)
- Tap "Continue" → Goes to Profile Creation Step 3
- Tap "Skip for now" → Goes to Profile Creation Step 3

**Design Notes:**
- Card-based layout for each option
- Visual icons for each attachment style and love language
- Tappable cards with selected state (purple border)
- "Skip for now" is visible but not prominent

---

### 1.4 Profile Creation (Step 3: Confirm)

**Screen:** Profile Review

**Elements:**
- Progress indicator: "Step 3 of 3"
- Heading: "Review your profile"
- Summary card:
  - Name (if provided)
  - Date of birth (formatted: "January 15, 1990")
  - Birth time (if provided, formatted: "3:45 PM")
  - Birth place (if provided: "New York, USA")
  - Attachment style (if provided)
  - Love languages (if provided)
- Edit button (pencil icon) for each field
- Checkbox: "I agree to the Terms of Service and Privacy Policy" (required)
- Primary CTA: "Generate My Soul Blueprint" (large, purple, glowing)
- Secondary link: "Go back"

**User Actions:**
- Review details
- Tap edit icon → Goes back to relevant step
- Check terms agreement checkbox
- Tap "Generate My Soul Blueprint" → Shows loading screen, then goes to Dashboard
- Tap "Go back" → Goes to Profile Creation Step 2

**Loading State:**
- Animated cosmic circle
- Progress text: "Calculating your chart...", "Analyzing your numerology...", "Synthesizing your blueprint..."
- Duration: ~5-10 seconds (actual calculation time varies)

**Design Notes:**
- Clean summary with good spacing
- Terms checkbox must be checked to enable CTA
- Loading animation feels mystical, not technical

---

## 2. Dashboard (Home)

### 2.1 Main Dashboard

**Screen:** Soul Blueprint Dashboard

**Header:**
- User greeting: "Welcome, [Name]" or "Welcome, Soul Seeker" (if no name)
- Settings icon (gear) → Goes to Settings
- Profile edit icon → Goes back to Profile Edit mode

**Quick Stats Section:**
- **Sun Sign** (large, with icon): "Capricorn ♑"
- **Life Path Number** (large): "7"
- **Human Design Type** (large): "Manifesting Generator"
- Swipeable cards on mobile, 3-column grid on desktop

**Today Section:**
- Card: "Daily Insights"
  - Current biorhythm visualization (mini chart)
  - Key transit today: "Moon in Pisces"
  - Prompt: "What emotions are surfacing for you today?"
  - CTA: "Reflect" → Goes to Daily Insights

**Main Navigation Tabs:**
- **Blueprint** (default selected)
- **Compatibility**
- **People**
- **Insights**
- **More**

**Blueprint Tab Content:**
- Scrollable sections (accordion or tabs):
  - **Astrology**
    - Natal chart visualization (circular chart)
    - Sun, Moon, Rising
    - Planets in signs and houses
    - Major aspects
    - CTA: "View Full Chart"
  - **Numerology**
    - Life path, destiny, soul urge numbers
    - Explanations for each
  - **Human Design**
    - Type, authority, strategy
    - Centers (defined/undefined chart)
    - Gates and channels
  - **Chinese Astrology**
    - Zodiac animal, element
    - Personality traits
  - **Vedic Astrology**
    - Rashi (moon sign), nakshatra
    - Planetary periods (dasha)
  - **Other Systems**
    - Biorhythms, chakras, Ayurveda, etc.
    - Collapsed by default, expandable

**Floating Action Button (FAB):**
- Cosmic orb icon (purple, glowing)
- Position: Bottom right
- Tap → Opens AI Soul Guide Chat modal

**User Actions:**
- Scroll through blueprint sections
- Tap section headers to expand/collapse
- Tap "View Full Chart" → Goes to detailed chart page
- Tap daily insights card → Goes to Daily Insights
- Switch tabs → Shows different content
- Tap FAB → Opens AI chat
- Tap settings → Goes to Settings

**Design Notes:**
- Sticky header with user greeting
- Tab bar sticky at top or bottom (mobile: bottom, desktop: top)
- Smooth scroll animations between sections
- Lazy load heavy content (charts) as user scrolls
- Pull-to-refresh gesture (mobile) to reload data

---

### 2.2 Detailed Chart View

**Screen:** Full Natal Chart

**Header:**
- Back arrow → Returns to Dashboard
- Title: "Your Natal Chart"
- Share icon → Share chart as image
- Download icon → Download as PDF

**Content:**
- Large natal chart visualization (full screen width)
- Zoom and pan gestures (pinch to zoom on mobile)
- Planet list below chart:
  - Sun in Capricorn, 10th House
  - Moon in Gemini, 3rd House
  - Mercury in Sagittarius, 9th House
  - (etc.)
- Aspects list (expandable):
  - Sun Trine Jupiter (120°, 2° orb)
  - Moon Square Mars (90°, 3° orb)
  - (etc.)
- Interpretation sections (collapsible):
  - "Your Sun in Capricorn" (paragraph explanation)
  - "Your Moon in Gemini" (paragraph explanation)
  - (etc.)

**User Actions:**
- Pinch to zoom chart
- Tap planet on chart → Highlights connections
- Tap planet in list → Scrolls to interpretation
- Expand/collapse interpretation sections
- Share chart → Opens native share sheet
- Download PDF → Generates PDF with loading toast

**Design Notes:**
- Chart is interactive, not just static image
- Planet colors match traditional astrology conventions
- Aspect lines color-coded (green = harmonious, red = challenging, blue = neutral)
- Interpretations use empowering language, not deterministic

---

## 3. Compatibility Flow

### 3.1 People List

**Screen:** Saved People

**Header:**
- Back arrow → Returns to Dashboard
- Title: "My People"
- Add person icon (+) → Goes to Add Person

**Content:**
- Empty state (if no people saved):
  - Illustration: Two cosmic orbs connecting
  - Heading: "Add people to check compatibility"
  - Subtext: "Compare yourself with partners, friends, family, or colleagues"
  - Primary CTA: "Add First Person"
  - Secondary CTA: "Add Yourself" (creates person from your profile)
- Person cards (if people saved):
  - Name
  - Date of birth (formatted)
  - Label tag: "Partner", "Friend", "Family", etc.
  - Last compared: "2 days ago"
  - Options menu (three dots) → Edit, Delete
- Primary CTA (bottom): "Compare Two People" (disabled if < 2 people)

**User Actions:**
- Tap "Add First Person" or (+) → Goes to Add Person Form
- Tap "Add Yourself" → Creates person from profile, shows success toast
- Tap person card → Opens person detail view (future)
- Tap options menu → Shows Edit, Delete
- Tap "Compare Two People" → Goes to Select People for Comparison

**Design Notes:**
- Cards have subtle shadows, rounded corners
- Empty state is encouraging, not discouraging
- "Add Yourself" button is prominent if not already added

---

### 3.2 Add Person Form

**Screen:** Add New Person

**Header:**
- Back arrow → Returns to People List
- Title: "Add Person"

**Form:**
- **Full Name** (text input, required)
- **Date of Birth** (date picker, required)
- **Birth Time** (time picker, optional)
  - Toggle: "I don't know their birth time"
- **Birth Place** (location search, optional)
- **Relationship** (dropdown, optional)
  - Options: Partner, Friend, Family, Colleague, Crush, Ex, Other
- **Attachment Style** (radio buttons, optional)
- **Love Languages** (checkboxes, optional)
- Notes field (text area, optional): "Any other info about this person"

**CTAs:**
- Primary: "Save Person"
- Secondary: "Cancel"

**User Actions:**
- Fill out form (name and DOB required)
- Tap "Save Person" → Saves to database, shows success toast, returns to People List
- Tap "Cancel" → Returns to People List (confirm if form has content)

**Validation:**
- Name and DOB required
- Same validation as profile creation form

**Design Notes:**
- Same styling as profile creation form
- Notes field expands as user types
- Help tooltips for optional fields

---

### 3.3 Select People for Comparison

**Screen:** Select Two People

**Header:**
- Back arrow → Returns to People List
- Title: "Compare"

**Content:**
- Dropdown/listbox: "Person 1"
  - Options: All saved people + "Yourself"
  - Default: "Yourself"
- Dropdown/listbox: "Person 2"
  - Options: All saved people except Person 1
  - Default: First saved person
- Preview cards showing selected people:
  - Name, DOB, relationship tag
- Primary CTA: "Generate Compatibility Report" (large button)

**User Actions:**
- Select Person 1 from dropdown
- Select Person 2 from dropdown
- Tap "Generate Compatibility Report" → Shows loading, goes to Compatibility Report

**Loading State:**
- Animated cosmic circles connecting
- Progress text: "Analyzing charts...", "Calculating synastry...", "Generating insights..."
- Duration: ~3-8 seconds

**Design Notes:**
- Dropdowns are touch-friendly (large tap targets)
- Preview cards update in real-time as selections change
- Loading animation shows two orbs connecting with lines

---

### 3.4 Compatibility Report

**Screen:** Compatibility Report

**Header:**
- Back arrow → Returns to Select People
- Title: "[Person 1] & [Person 2]"
- Share icon → Share report
- Download icon → Download as PDF

**Content (scrollable):**

**Section 1: Overall Score**
- Large circular gauge: 78/100
- Label: "Strong Compatibility"
- Relationship category: "Great Match 💫"
- Brief summary: "You share strong emotional connection and long-term potential. Some areas need work, but overall very compatible."

**Section 2: 5 Pillars**
- Bar chart or card grid:
  - **Attraction:** 85/100 (high chemistry)
  - **Emotional:** 92/100 (deep understanding)
  - **Lifestyle:** 65/100 (some differences)
  - **Long-Term:** 88/100 (solid foundation)
  - **Timing:** 70/100 (good moment to connect)
- Tap each pillar → Expands with detailed explanation

**Section 3: Detailed Aspects**
- Expandable sections:
  - Sexual compatibility: 88/100
  - Communication: 82/100
  - Trust: 90/100
  - Friendship: 95/100
  - Emotional connection: 92/100
  - Intimacy: 85/100
  - Common values: 78/100
  - Colleagues: 70/100
  - Marriage potential: 88/100

**Section 4: Synastry Highlights**
- "Golden Aspects" (highly harmonious):
  - Venus Trine Moon: "Deep emotional and romantic harmony"
  - Sun Sextile Jupiter: "Optimism and growth together"
- "Diamond Aspects" (powerful):
  - Mars Conjunction Venus: "Strong physical attraction and passion"
- "Fated Aspects" (karmic):
  - North Node Conjunction Sun: "Destined connection, soul growth"
- "Challenges" (growth opportunities):
  - Moon Square Saturn: "Emotional restrictions, needs patience"

**Section 5: Relationship Advice**
- "Strengths to Celebrate" (bulleted list):
  - "Your emotional connection is rare and precious"
  - "You communicate naturally and openly"
  - "You share core values and life goals"
- "Areas to Work On" (bulleted list):
  - "Different social needs—compromise on alone vs. together time"
  - "Money values differ—have honest financial discussions"
- "Tips for Success" (bulleted list):
  - "Schedule weekly check-ins to stay connected"
  - "Practice active listening, especially during disagreements"
  - "Honor each other's need for independence"

**Section 6: Chart Overlays**
- House overlays: "[Person 1]'s Venus in [Person 2]'s 7th house—romantic attraction felt by both"
- Composite chart highlights (future feature)

**CTAs:**
- Floating: "Ask AI about this relationship" (opens chat with context)
- Bottom: "Save Report" (future: add notes)

**User Actions:**
- Scroll through report sections
- Tap pillar cards to expand details
- Tap synastry aspects to see full explanation
- Share report → Native share sheet
- Download PDF → Generates PDF
- Tap "Ask AI" → Opens chat with pre-loaded context about this compatibility

**Design Notes:**
- Color-coded scores (red = low, yellow = medium, green = high)
- Empowering language: "areas to work on" not "problems"
- Balanced presentation: strengths and challenges both visible
- No deterministic "this won't work" language
- Disclaimer at bottom: "Compatibility is just one factor. Real relationships require communication, effort, and mutual respect."

---

## 4. Daily Insights Flow

### 4.1 Daily Insights Page

**Screen:** Today's Insights

**Header:**
- Back arrow → Returns to Dashboard
- Title: "Daily Insights"
- Calendar icon → Opens date picker to see past/future insights

**Content:**

**Section 1: Today's Energy**
- Date: "Friday, December 27, 2025"
- Moon phase icon + text: "Waxing Gibbous in Pisces"
- Biorhythm mini chart (physical, emotional, intellectual curves)
- Energy summary: "Your emotional and intuitive energies are heightened today. Physical energy is moderate—pace yourself."

**Section 2: Key Transits**
- Card list:
  - Transit 1: "Moon in Pisces (3rd House)"
    - "Heightened intuition and creativity in communication"
  - Transit 2: "Mercury Sextile Venus"
    - "Great day for heartfelt conversations and artistic expression"
  - Transit 3: "Jupiter in your 7th House"
    - "Relationships are expanding—new people entering your life"

**Section 3: Reflection Prompt**
- Card with prompt: "What emotions are surfacing for you today? How can you honor them?"
- Text area: Free-form writing space
- CTA: "Save Reflection" → Saves to journal (future: journaling feature)
- Link: "Get a new prompt"

**Section 4: Cosmic Guidance**
- AI-generated personalized advice based on transits and profile
- Example: "With Moon in Pisces, this is a beautiful day for creative projects and deep conversations. Your intuition is sharp—trust your gut feelings about people and situations. Avoid overcommitting to social plans; your energy is best spent on meaningful one-on-one connections."

**Section 5: Affirmations**
- 3-5 personalized affirmations:
  - "I trust my intuition and inner wisdom"
  - "I communicate my feelings with clarity and compassion"
  - "I am open to growth and new experiences"

**CTAs:**
- Floating button: "Ask AI about today" → Opens chat with today's transits context

**User Actions:**
- Read insights and transits
- Tap transit cards to expand details
- Write reflection (auto-saves as draft)
- Tap "Save Reflection" → Saves to journal, shows success toast
- Tap "Get a new prompt" → Loads different prompt
- Tap calendar icon → Opens date picker to see other days
- Tap "Ask AI" → Opens chat

**Design Notes:**
- Refreshes daily (cached for performance)
- Transits are brief but informative
- Reflection prompt changes daily based on profile + transits
- Affirmations are encouraging, not cheesy

---

### 4.2 Calendar View (Future)

**Screen:** Insights Calendar

**Content:**
- Month calendar view
- Days with significant transits are highlighted (colored dots)
- Tap day → Shows that day's insights
- Swipe to change months

**User Actions:**
- Navigate through months
- Tap highlighted day → Loads insights for that day
- Tap today → Returns to current day

---

## 5. AI Soul Guide Chat Flow

### 5.1 Chat Interface

**Screen:** AI Soul Guide Chat (Modal)

**Header:**
- Title: "Soul Guide 🔮"
- Close button (X) → Closes chat modal

**Content:**
- Chat message list (scrollable):
  - **AI messages:** Left-aligned, purple bubble
  - **User messages:** Right-aligned, gray bubble
  - Timestamp under each message
- **Initial AI message:** "Hello, Soul Seeker! I'm here to help you understand your cosmic blueprint. What would you like to know?"

**Input Area:**
- Text input field: "Ask me anything..."
- Send button (paper airplane icon)
- Microphone icon (future: voice input)

**Suggested Prompts (if no messages yet):**
- Chips/buttons with examples:
  - "What does my Sun in Capricorn mean?"
  - "Why am I compatible with my partner?"
  - "What are today's transits?"
  - "Explain my Human Design type"

**User Actions:**
- Type message in input field
- Tap suggested prompt → Sends that message
- Tap send button → Sends message, AI streams response
- Scroll through message history
- Tap close → Closes modal (conversation history preserved)

**Streaming Behavior:**
- AI response appears word-by-word as streamed
- Loading indicator (three dots) while waiting for first token
- Smooth typing animation

**Error Handling:**
- If API fails: "I'm having trouble connecting right now. Please try again in a moment."
- If request takes too long: "This is taking longer than expected. Would you like to wait or try rephrasing your question?"

**Design Notes:**
- Modal with glassmorphism effect (semi-transparent background blur)
- Full-screen on mobile, centered card on desktop
- Chat bubbles have tail pointing to sender
- Auto-scroll to latest message
- Input field expands with multi-line text
- Keyboard-aware layout (doesn't cover input on mobile)

---

### 5.2 Chat Context Examples

**Scenario 1: Profile Questions**
- User: "What does my Sun in Capricorn mean?"
- AI: "Your Sun in Capricorn gives you a grounded, ambitious, and disciplined core. You're likely drawn to structure, long-term goals, and meaningful achievement. Capricorn Suns often have strong work ethics and value integrity. Your Sun is in your 10th House, amplifying these themes in your career and public life. You're here to build something lasting and respected. How does this resonate with your experience?"

**Scenario 2: Compatibility Questions**
- User: "Why am I so compatible with my partner?"
- AI: "Based on your synastry with [Partner Name], you have several strong indicators of compatibility:
  1. Your Venus trines their Moon—deep emotional and romantic harmony
  2. Your Sun sextiles their Jupiter—you bring out each other's optimism
  3. Your Mars conjuncts their Venus—strong physical chemistry
Your overall compatibility score is 85/100, with particular strengths in emotional connection (92) and long-term potential (88). Your charts support each other's growth. What aspect of your relationship would you like to explore more?"

**Scenario 3: Daily Insights**
- User: "What should I focus on today?"
- AI: "Today, the Moon is in Pisces in your 3rd House, heightening your intuition and creativity in communication. Mercury is sextile Venus, making it a beautiful day for heartfelt conversations and creative expression. Your biorhythms show high emotional energy but moderate physical energy—pace yourself physically, but lean into deep conversations and artistic projects. This is a day for meaningful connection over superficial socializing. What area of your life feels most alive right now?"

**Scenario 4: Complex Chart Questions**
- User: "What's my Saturn return about?"
- AI: "Your Saturn return happens when Saturn returns to the exact position it was when you were born, around age 29-30. For you, Saturn is in Aquarius in your 11th House. This return will be about:
  - Maturing your friendships and community connections
  - Taking responsibility for your role in groups and networks
  - Clarifying your long-term vision and social impact
Saturn returns can feel challenging, but they're about building solid foundations for the next 30 years. What changes have you noticed in your friendships or community involvement recently?"

---

## 6. Export & Share Flow

### 6.1 PDF Export

**Trigger:** User taps "Download PDF" button (on Dashboard or Compatibility Report)

**Flow:**
1. **Loading Toast:** "Preparing your report..." (toast notification)
2. **Progress Toast:** "Generating PDF..." (toast updates)
3. **Background Work:**
   - Dynamically import html2canvas and jsPDF libraries (lazy loaded)
   - Render charts and content as images
   - Compile into PDF document
   - Trigger browser download
4. **Success Toast:** "PDF downloaded! Check your downloads folder." (with checkmark icon)

**PDF Contents (Profile):**
- Cover page: "Soul Codex - [User Name]'s Blueprint"
- Table of contents
- Astrology section (chart + interpretations)
- Numerology section
- Human Design section
- Other systems
- Footer: "Generated by Soul Codex | [Date]"

**PDF Contents (Compatibility):**
- Cover page: "[Person 1] & [Person 2] - Compatibility Report"
- Overall score and summary
- 5 pillars breakdown
- Detailed aspects
- Synastry highlights
- Relationship advice
- Footer: "Generated by Soul Codex | [Date]"

**User Actions:**
- Download triggers automatically on success
- Mobile: PDF saved to device downloads
- Desktop: Browser download prompt

**Error Handling:**
- If PDF generation fails: "Unable to generate PDF. Please try again." (error toast)
- Retry button in toast

**Design Notes:**
- Loading states with progress feedback (not silent)
- Sequential toasts (not trying to update same toast)
- PDF formatting is clean and printable
- PDF includes disclaimers about entertainment/reflection use

---

### 6.2 Share Report

**Trigger:** User taps "Share" button

**Flow:**
1. Opens native share sheet (mobile) or copy link (desktop)
2. **Options:**
   - Copy link (generates shareable URL with read-only access)
   - Share via messaging apps (WhatsApp, Telegram, etc.)
   - Share via social (Twitter, Facebook, etc.)
   - Share via email

**Shareable Link:**
- Format: `https://soulcodex.app/shared/[unique-id]`
- Read-only view (can't edit profile)
- Privacy-controlled (user chooses what to share)
- Expires after 30 days (configurable)

**Privacy Controls (Future):**
- Checkbox options before sharing:
  - [x] Include full chart
  - [x] Include numerology
  - [x] Include compatibility scores
  - [ ] Include psychological profile (default off)

**User Actions:**
- Select share method from native sheet
- Link copied → "Link copied!" toast
- Link shared → Return to app

**Design Notes:**
- Uses native share API for seamless experience
- Respects user privacy (opt-in sharing)
- Shared view has "Create Your Own Blueprint" CTA

---

## 7. Settings & Account Flow

### 7.1 Settings Screen

**Screen:** Settings

**Header:**
- Back arrow → Returns to Dashboard
- Title: "Settings"

**Content (sections):**

**Account Section:**
- Profile picture (future)
- Name
- Email (if registered)
- CTA: "Edit Profile" → Goes to profile edit form
- CTA: "Change Password" (if local account)

**Subscription Section:**
- Current tier: "Free" or "Premium"
- Features unlocked: List
- CTA: "Upgrade to Premium" (if free) → Goes to pricing page
- CTA: "Manage Subscription" (if premium) → Opens Stripe portal

**Privacy Section:**
- Toggle: "Save data locally only" (offline mode)
- Toggle: "Enable analytics" (Microsoft Clarity)
- CTA: "Export My Data" → Downloads JSON of all user data
- CTA: "Delete My Account" → Confirmation dialog

**Notifications Section (Future):**
- Toggle: "Daily insights"
- Toggle: "Transit alerts"
- Toggle: "Relationship reminders"

**Preferences Section:**
- Dropdown: "Astrology system" (Western, Vedic)
- Dropdown: "House system" (Placidus, Whole Sign, etc.)
- Toggle: "Use 24-hour time"

**About Section:**
- App version: "v1.0.0"
- Links: "Terms of Service", "Privacy Policy", "Contact Support"
- CTA: "Rate Us" (App Store)

**User Actions:**
- Tap any setting to edit
- Toggles update in real-time
- CTA buttons navigate to relevant screens
- "Delete Account" requires confirmation + password

**Design Notes:**
- Grouped sections with headers
- Toggles show current state clearly
- Destructive actions (delete account) use red color
- Settings auto-save (no "save" button needed)

---

### 7.2 Edit Profile

**Screen:** Edit Profile

**Flow:** Same as profile creation form, but pre-filled with existing data

**User Actions:**
- Edit any field
- Tap "Save Changes" → Updates profile, regenerates insights if birth data changed
- Tap "Cancel" → Returns to settings

**Validation:**
- Same as profile creation

---

### 7.3 Upgrade to Premium

**Screen:** Pricing

**Header:**
- Back arrow → Returns to settings
- Title: "Upgrade to Premium"

**Content:**

**Free Tier Card:**
- Title: "Free"
- Price: "$0/month"
- Features (checkmarks):
  - ✅ 1 full soul profile
  - ✅ 3 compatibility checks/month
  - ✅ Daily insights
  - ✅ AI chat (limited)
  - ❌ Advanced transits
  - ❌ Unlimited compatibility
  - ❌ Priority support

**Premium Tier Card (highlighted):**
- Badge: "Best Value"
- Title: "Premium"
- Price: "$9.99/month or $89.99/year" (save 25%)
- Features (checkmarks):
  - ✅ Unlimited profiles
  - ✅ Unlimited compatibility checks
  - ✅ Advanced transits calendar
  - ✅ Priority AI chat
  - ✅ Premium reports (progressions, returns)
  - ✅ Export unlimited PDFs
  - ✅ Priority support
  - ✅ Early access to new features
- CTA: "Start Free Trial" (7 days free, then paid)

**Bottom:**
- "All plans include:" List of core features
- Link: "Compare plans in detail"
- Link: "Restore purchases" (for re-installs)

**User Actions:**
- Tap "Start Free Trial" → Opens Stripe payment sheet
- Complete payment → Subscription activated, returns to dashboard with success message
- Tap "Restore purchases" → Validates subscription, unlocks premium

**Design Notes:**
- Premium card is visually emphasized (purple border, shadow)
- Pricing clear and upfront (no hidden fees)
- 7-day free trial reduces friction
- Annual plan shows savings clearly

---

## 8. Mobile-Specific Interactions

### Touch Gestures
- **Pull to refresh:** Dashboard, daily insights (reload data)
- **Swipe left/right:** Navigate between tabs, browse saved people
- **Pinch to zoom:** Natal chart, compatibility charts
- **Long press:** Context menu on saved people (edit, delete)
- **Swipe to dismiss:** Close modals, toast notifications

### Keyboard Handling
- **Auto-focus:** First input field on form screens
- **Keyboard type:** Numeric for time/date, text for name/location
- **Keyboard dismiss:** Tap outside input, "Done" button
- **Keyboard avoidance:** Content scrolls above keyboard, input stays visible

### Bottom Sheet / Modals
- **AI Chat:** Full-screen modal with close button
- **Date picker:** Native bottom sheet (iOS) or dialog (Android)
- **Share sheet:** Native share menu
- **Confirmation dialogs:** Center modal with overlay

### Notifications (Future)
- **Push notifications:** Daily insights reminder, transit alerts
- **In-app toasts:** Success, error, info messages (3 second duration)
- **Badge count:** Unread insights count on app icon

---

## 9. Offline Behavior

### Offline-First Features
- **Profile creation:** Works offline, syncs when online
- **View existing profile:** Cached, always available
- **View saved people:** Cached, always available
- **View past compatibility reports:** Cached, always available
- **Daily insights:** Last loaded day cached

### Requires Online
- **Generate new compatibility report:** Calculation happens server-side
- **AI Soul Guide chat:** OpenAI API requires internet
- **PDF export:** Chart rendering requires libraries (lazy loaded)
- **Sync data:** Cloud sync requires internet

### Offline UI Indicators
- **Status indicator:** Small cloud icon in header (gray = offline, green = online)
- **Disabled features:** AI chat button shows "Offline" tooltip, disabled state
- **Graceful degradation:** "You're offline. This feature requires internet." message
- **Queue actions:** Compatibility requests queue until online, then process

---

## 10. Error States & Edge Cases

### Empty States
- **No people saved:** Encouraging illustration + "Add your first person" CTA
- **No compatibility reports:** "Compare two people to see insights"
- **No journal entries:** "Start your first reflection"
- **No AI chat history:** Suggested prompts visible

### Error States
- **Failed to load profile:** "Unable to load your profile. Please try again." + Retry button
- **Failed API request:** "Something went wrong. Please try again." + Retry button
- **Network timeout:** "Request timed out. Check your connection." + Retry button
- **Invalid birth data:** "Please check your birth details and try again." (form validation)

### Edge Cases
- **Birth time unknown:** Use noon as default, note reduced accuracy for houses/rising
- **Birth place unknown:** Disable location-dependent features (houses), show note
- **Duplicate people:** Warn "You already have someone with this name. Add anyway?"
- **Comparing person with themselves:** Show message "Please select two different people"
- **Premium features on free tier:** Show upgrade prompt with feature list

---

## 11. Accessibility

### Screen Reader Support
- All interactive elements have ARIA labels
- Form inputs have associated labels
- Images have alt text
- Heading hierarchy (h1, h2, h3) for navigation

### Keyboard Navigation
- All features accessible via keyboard (tab, enter, arrow keys)
- Focus indicators visible on all interactive elements
- Skip links to main content

### Visual Accessibility
- Color contrast ratios meet WCAG AA standards (4.5:1 for text)
- Text resizable up to 200% without breaking layout
- Color not sole indicator (use icons + text)
- High contrast mode support (future)

### Cognitive Accessibility
- Clear, simple language (no jargon without explanation)
- Consistent navigation patterns
- Ample white space, not cluttered
- Progress indicators for multi-step flows

---

## 12. Performance Goals

### Load Times
- **First Contentful Paint (FCP):** < 1.5s on 3G
- **Time to Interactive (TTI):** < 4s on 3G
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1

### Interaction Latency
- **Tap response:** < 100ms
- **Page transitions:** < 300ms
- **Form validation:** Real-time, < 50ms
- **AI chat message:** First token < 2s

### Bundle Sizes
- **Initial JS bundle:** < 300KB gzipped
- **Initial CSS:** < 50KB gzipped
- **Heavy libraries (PDF):** Lazy loaded, not in initial bundle

---

## Document Status

**Completion:** ✅ All flows documented  
**Review Status:** Ready for Development  
**Next Update:** After v1 feature implementation  

---

**Document Owner:** Product & Design Team  
**Last Updated:** December 27, 2025
