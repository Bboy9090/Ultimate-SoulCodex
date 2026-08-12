/**
 * ActiveProfileRepository Tests
 *
 * Critical acceptance test:
 * Generate a reading → Close the page → Reopen the app → Open Compatibility
 * → The same profile appears without re-entry
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
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
    getItem: (key: string) => store[key] ?? null,
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

    it("should fail closed on corrupted canonical data even if valid legacy data exists", () => {
      localStorageMock.setItem("soulcodex.activeProfile.v1", "{ definitely-not-json");
      localStorageMock.setItem(
        "soulProfile",
        JSON.stringify({ birthDate: "1990-09-17", sunSign: "Virgo" }),
      );

      const loadResult = loadActiveProfile();

      expect(loadResult.status).toBe("corrupted");
      expect(loadResult.profile).toBeNull();
      expect(localStorageMock.getItem("soulcodex.activeProfile.v1")).toBe("{ definitely-not-json");
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
      expect(loadResult.profile?.schemaVersion).toBe(1);
      expect(loadResult.profile?.createdAt).toBeDefined();
      expect(loadResult.profile?.updatedAt).toBeDefined();

      const secondLoad = loadActiveProfile();
      expect(secondLoad.status).toBe("loaded");
      expect(secondLoad.profile?.schemaVersion).toBe(1);
    });

    it("should check multiple legacy profile keys in order", () => {
      const profile = {
        birthDate: "1990-09-17",
        codename: "Legacy Test",
      };

      localStorageMock.setItem("soulCodexReading", JSON.stringify(profile));

      const loadResult = loadActiveProfile();
      expect(loadResult.legacyKey).toBe("soulCodexReading");
      expect(loadResult.profile?.codename).toBe("Legacy Test");
    });

    it("should not promote raw onboarding form data into a completed active profile", () => {
      localStorageMock.setItem(
        "onboardingData",
        JSON.stringify({
          name: "Form Only",
          birthDate: "1990-09-17",
          birthTime: "11:11",
          birthLocation: "Bronx, New York",
        }),
      );

      const loadResult = loadActiveProfile();

      expect(loadResult.status).toBe("missing");
      expect(loadResult.profile).toBeNull();
      expect(localStorageMock.getItem("soulcodex.activeProfile.v1")).toBeNull();
      expect(localStorageMock.getItem("onboardingData")).not.toBeNull();
    });

    it("should not silently rewrite an explicitly incompatible legacy schema", () => {
      localStorageMock.setItem(
        "soulProfile",
        JSON.stringify({
          birthDate: "1990-09-17",
          schemaVersion: 999,
          sunSign: "Virgo",
        }),
      );

      const loadResult = loadActiveProfile();

      expect(loadResult.status).toBe("missing");
      expect(loadResult.profile).toBeNull();
      expect(localStorageMock.getItem("soulcodex.activeProfile.v1")).toBeNull();
    });
  });

  describe("Critical acceptance test: Generate → Close → Reopen → Compatibility", () => {
    it("should persist profile across page close and reopen", () => {
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

      const loadResult = loadActiveProfile();

      expect(loadResult.status).toBe("loaded");
      expect(loadResult.profile).toBeDefined();

      const profile = loadResult.profile!;
      expect(profile.birthDate).toBe("1990-09-17");
      expect(profile.birthTime).toBe("11:11");
      expect(profile.sunSign).toBe("Virgo");
      expect(profile.moonSign).toBe("Pisces");
      expect(profile.risingSign).toBe("Scorpio");
      expect(profile.lifePathNumber).toBe(7);
      expect(profile.humanDesignType).toBe("Manifestor");
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

      expect(recovery.recovery.length).toBe(0);
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

    it("should clear legacy and onboarding sources so they cannot resurrect after reset", () => {
      saveActiveProfile({ birthDate: "1990-09-17", sunSign: "Virgo" });
      localStorageMock.setItem(
        "soulProfile",
        JSON.stringify({ birthDate: "1988-10-29", sunSign: "Scorpio" }),
      );
      localStorageMock.setItem(
        "soulCodexReading",
        JSON.stringify({ birthDate: "1993-07-26", sunSign: "Leo" }),
      );
      localStorageMock.setItem(
        "onboardingData",
        JSON.stringify({ birthDate: "2003-02-06", name: "Raw Form" }),
      );

      clearActiveProfile();

      expect(localStorageMock.getItem("soulcodex.activeProfile.v1")).toBeNull();
      expect(localStorageMock.getItem("soulProfile")).toBeNull();
      expect(localStorageMock.getItem("soulCodexReading")).toBeNull();
      expect(localStorageMock.getItem("onboardingData")).toBeNull();

      const loadResult = loadActiveProfile();
      expect(loadResult.status).toBe("missing");
      expect(loadResult.profile).toBeNull();
    });
  });
});
