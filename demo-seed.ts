/**
 * Demo Mode Seed
 *
 * When DEMO_MODE=true, this seeds the in-memory storage with a demo user and
 * a complete demo profile so developers and reviewers can explore the full app
 * experience without setting up a database or going through onboarding.
 *
 * Demo credentials:
 *   Email:    demo@soulcodex.app
 *   Password: demo1234
 */

import { hashPassword } from "./passwordUtils";
import { storage } from "./storage";

const DEMO_USER_ID = "demo-user-001";
const DEMO_PROFILE_SEED = {
  userId: DEMO_USER_ID,
  sessionId: null,
  name: "Alex Demo",
  birthDate: "1990-06-15",
  birthTime: "14:30",
  birthLocation: "New York, NY, USA",
  timezone: "America/New_York",
  latitude: "40.7128",
  longitude: "-74.0060",
  isPremium: false,
  // Pre-populated data objects are null here — the app calculates them on first
  // profile load via the /api/soul-archetype and /api/profile/:id endpoints.
  astrologyData: null,
  numerologyData: null,
  personalityData: null,
  archetypeData: null,
  humanDesignData: null,
  soulArchetypeData: null,
  elementalMedicineData: null,
  moralCompassData: null,
  parentalInfluenceData: null,
};

export async function seedDemoData(): Promise<void> {
  if (process.env.DEMO_MODE !== "true") {
    return;
  }

  try {
    // Check if demo user already exists (idempotent)
    const existing = await storage.getLocalUserByEmail("demo@soulcodex.app");
    if (existing) {
      console.info("[Demo] Demo user already seeded — skipping.");
      return;
    }

    // Hash the demo password
    const passwordHash = await hashPassword("demo1234");

    // Create the User record
    await storage.upsertUser({
      id: DEMO_USER_ID,
      email: "demo@soulcodex.app",
      firstName: "Alex",
      lastName: "Demo",
    });

    // Create the LocalUser record (for Passport local auth)
    await storage.createLocalUser(DEMO_USER_ID, "demo@soulcodex.app", passwordHash);

    // Create the Profile record
    await storage.createProfile(DEMO_PROFILE_SEED);

    console.info(`
========================================
🎭 Demo Mode Active
========================================
A demo account has been seeded.

  Email:    demo@soulcodex.app
  Password: demo1234

Visit /api/auth/login to sign in, or use
the app's login form.
========================================
`);
  } catch (err) {
    console.error("[Demo] Failed to seed demo data:", err);
  }
}
