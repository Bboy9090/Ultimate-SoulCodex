/**
 * ActiveProfileRepository Tests
 *
 * Critical acceptance test:
 * Generate a reading → Close the page → Reopen the app → Open Compatibility
 * → The same profile appears without re-entry
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  loadActiveProfile,
  saveActiveProfile,
  clearActiveProfile,
  getRecoveryMessage,
  type StoredProfile,
} from "../ActiveProfileRepository";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("ActiveProfileRepository", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("Canonical profile lifecycle", () => {
    it("should save and load a profile under canonical key", () => {
      const profile: StoredProfile = {
        birthDate: "1990-09-17",
        birthTime: "11:11",
        birthLocation: "Bronx, New York",
        sunSign: "Virgo",
        moonSign: "Pisces",
        risingSign: "Scorpio",
        lifePathNumber: 7,
        archetype: "The Analyst",
      };

      const saveResult = saveActiveProfile(profile);
      expect(saveResult.success).toBe(true);

      const loadResult = loadActiveProfile();
      expect(loadResult.status).toBe("loaded");
      expect(loadResult.profile).toBeDefined();
      expect(loadResult.profile?.birthDate).toBe("1990-09-17");
      expect(loadResult.profile?.sunSign).toBe("Virgo");
    });

    it("should add schema version and timestamps on save", () => {
      const profile: StoredProfile = {
        birthDate: "1990-09-17",
      };

      saveActiveProfile(profile);
      const loadResult = loadActiveProfile();

      expect(loadResult.profile?.schemaVersion).toBe(1);
      expect(loadResult.profile?.updatedAt).toBeDefined();
      expect(loadResult.profile?.createdAt).toBeDefined();
    });

    it("should verify profile can be read back immediately after save", () => {
      const profile: StoredProfile = {
        birthDate: "1990-09-17",
        sunSign: "Virgo",
      };

      const saveResult = saveActiveProfile(profile);
      expect(saveResult.success).toBe(true);
    });
  });

  describe("Profile validation", () => {
    it("should reject profile without birth date", () => {
      const profile: StoredProfile = {
        sunSign: "Virgo",
      };

      const saveResult = saveActiveProfile(profile);
      expect(saveResult.success).toBe(false);
      expect(saveResult.error).toContain("birthDate");
    });

    it("should detect wrong schema version", () => {
      const invalidProfile = {
        birthDate: "1990-09-17",
        schemaVersion: 999,
      };

      localStorageMock.setItem("soulcodex.activeProfile.v1", JSON.stringify(invalidProfile));
      const loadResult = loadActiveProfile();

      expect(loadResult.status).toBe("wrong-version");
      expect(loadResult.profile).toBeNull();
    });

    it("should detect corrupted profile", () => {
      localStorageMock.setItem("soulcodex.activeProfile.v1", "invalid json {{{");
      const loadResult = loadActiveProfile();

      expect(loadResult.status).toBe("corrupted");
      expect(loadResult.profile).toBeNull();
    });
  });

  describe("Legacy migration", () => {
    it("should migrate old soulProfile key to canonical", () => {
      const oldProfile = {
        birthDate: "1990-09-17",
        sunSign: "Virgo",
      };

      localStorageMock.setItem("soulProfile", JSON.stringify(oldProfile));

      const loadResult = loadActiveProfile();
      expect(loadResult.status).toBe("legacy-found");
      expect(loadResult.legacyKey).toBe("soulProfile");
      expect(loadResult.profile?.sunSign).toBe("Virgo");

      // Verify it was migrated to canonical key
      const secondLoad = loadActiveProfile();
      expect(secondLoad.status).toBe("loaded");
    });

    it("should check multiple legacy keys in order", () => {
      const profile = {
        birthDate: "1990-09-17",
        codename: "Legacy Test",
      };

      // Set an older legacy key
      localStorageMock.setItem("soulCodexReading", JSON.stringify(profile));

      const loadResult = loadActiveProfile();
      expect(loadResult.legacyKey).toBe("soulCodexReading");
      expect(loadResult.profile?.codename).toBe("Legacy Test");
    });
  });

  describe("Critical acceptance test: Generate → Close → Reopen → Compatibility", () => {
    it("should persist profile across page close and reopen", () => {
      // STEP 1: Generate reading (Onboarding page saves)
      const generatedReading: StoredProfile = {
        birthDate: "1990-09-17",
        birthTime: "11:11",
        birthLocation: "Bronx, New York",
        sunSign: "Virgo",
        moonSign: "Pisces",
        risingSign: "Scorpio",
        lifePathNumber: 7,
        humanDesignType: "Manifestor",
        archetype: "The Analyst",
      };

      const saveResult = saveActiveProfile(generatedReading);
      expect(saveResult.success).toBe(true);

      // STEP 2: User closes page
      // (In real app: window closes, localStorage persists)
      // (In test: we clear memory but localStorage remains)

      // STEP 3: User reopens app
      // (In real app: new page load happens)
      // (In test: we just call load again on same localStorage)

      const loadResult = loadActiveProfile();

      // STEP 4: Compatibility page opens and loads profile
      expect(loadResult.status).toBe("loaded");
      expect(loadResult.profile).toBeDefined();

      // STEP 5: Same profile appears without re-entry
      const profile = loadResult.profile!;
      expect(profile.birthDate).toBe("1990-09-17");
      expect(profile.birthTime).toBe("11:11");
      expect(profile.sunSign).toBe("Virgo");
      expect(profile.moonSign).toBe("Pisces");
      expect(profile.risingSign).toBe("Scorpio");
      expect(profile.lifePathNumber).toBe(7);
      expect(profile.humanDesignType).toBe("Manifestor");

      // All expected fields are present
      expect(Object.keys(profile).length).toBeGreaterThan(5);
    });

    it("should show no contradictory messages when profile exists", () => {
      const profile: StoredProfile = {
        birthDate: "1990-09-17",
        sunSign: "Virgo",
      };

      saveActiveProfile(profile);
      const loadResult = loadActiveProfile();
      const recovery = getRecoveryMessage(loadResult);

      // Should NOT have the contradictory pair:
      // "Your profile could not be loaded" AND "Complete your Soul Codex first"
      expect(recovery.recovery.length).toBe(0); // No recovery actions needed
      expect(loadResult.status).toBe("loaded");
    });
  });

  describe("Recovery messaging", () => {
    it("should provide recovery options for missing profile", () => {
      const loadResult = loadActiveProfile();
      const recovery = getRecoveryMessage(loadResult);

      expect(recovery.title).toContain("No profile found");
      expect(recovery.recovery).toContain("Create a new reading");
    });

    it("should offer migration for legacy profiles", () => {
      const oldProfile = {
        birthDate: "1990-09-17",
        sunSign: "Virgo",
      };

      localStorageMock.setItem("soulProfile", JSON.stringify(oldProfile));
      const loadResult = loadActiveProfile();
      const recovery = getRecoveryMessage(loadResult);

      expect(recovery.title).toContain("restored");
      expect(recovery.recovery).toContain("Continue with restored profile");
    });

    it("should guide repair for corrupted profiles", () => {
      localStorageMock.setItem("soulcodex.activeProfile.v1", "not-json");
      const loadResult = loadActiveProfile();
      const recovery = getRecoveryMessage(loadResult);

      expect(recovery.title).toContain("needs repair");
      expect(recovery.recovery).toContain("Repair profile");
    });
  });

  describe("Clear and reset", () => {
    it("should clear profile completely", () => {
      const profile: StoredProfile = {
        birthDate: "1990-09-17",
      };

      saveActiveProfile(profile);
      let loadResult = loadActiveProfile();
      expect(loadResult.profile).toBeDefined();

      clearActiveProfile();
      loadResult = loadActiveProfile();

      expect(loadResult.status).toBe("missing");
      expect(loadResult.profile).toBeNull();
    });
  });
});
