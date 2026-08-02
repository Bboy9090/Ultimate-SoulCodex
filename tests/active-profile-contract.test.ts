import { beforeEach, describe, expect, it } from "vitest";
import {
  clearActiveProfile,
  deriveConfidenceState,
  loadActiveProfile,
  saveActiveProfile,
} from "../client/src/lib/profileStorage";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const evidence = {
  source: "independent ephemeris comparison",
  engine: "engine-a+engine-b",
  calculatedAt: "2026-08-02T20:15:00Z",
};

describe("canonical active Soul Profile contract", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
  });

  it("round-trips one profile through the legacy wrapper and canonical key", () => {
    saveActiveProfile({
      id: "bobby-foundation-fixture",
      codename: "Bobby",
      birthDate: "1990-09-17",
      lifePathNumber: 9,
    });

    const restored = loadActiveProfile();
    expect(restored?.id).toBe("bobby-foundation-fixture");
    expect(restored?.birthDate).toBe("1990-09-17");
    expect(restored?.lifePathNumber).toBe(9);
    expect(restored?.schemaVersion).toBe(1);
    expect(localStorage.getItem("soulcodex.activeProfile.v1")).toBeTruthy();
  });

  it("does not call a profile verified merely because time and location were entered", () => {
    expect(deriveConfidenceState({
      birthDate: "1990-09-17",
      birthTime: "11:11",
      birthLocation: "Bronx, NY",
    })).toBe("partial");
  });

  it("rejects a copied profile-level verified label without placement evidence", () => {
    expect(deriveConfidenceState({
      birthDate: "1990-09-17",
      confidence: { verificationStatus: "verified" },
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "pending_independent_verification" },
        moon: { sign: "Virgo", verificationStatus: "pending_independent_verification" },
        rising: { sign: "Scorpio", verificationStatus: "unresolved" },
      },
    })).toBe("partial");
  });

  it("requires evidence-complete verified placements for verified confidence", () => {
    expect(deriveConfidenceState({
      birthDate: "1990-09-17",
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "verified", evidence },
        moon: { sign: "Virgo", verificationStatus: "verified", evidence },
        rising: { sign: "Scorpio", verificationStatus: "verified", evidence },
      },
    })).toBe("verified");
  });

  it("keeps pending populated placements partial", () => {
    expect(deriveConfidenceState({
      birthDate: "1990-09-17",
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "pending_independent_verification", evidence },
        moon: { sign: "Virgo", verificationStatus: "pending_independent_verification", evidence },
        rising: { sign: "Scorpio", verificationStatus: "unresolved", evidence },
      },
    })).toBe("partial");
  });

  it("clears the shared profile for every consumer", () => {
    saveActiveProfile({ birthDate: "1990-09-17" });
    clearActiveProfile();
    expect(loadActiveProfile()).toBeNull();
  });
});
