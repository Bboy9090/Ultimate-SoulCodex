import { test } from "node:test";
import assert from "node:assert";
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

test("canonical active Soul Profile contract", async (t) => {
  await t.test("sets up memory storage before each test", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
  });

  await t.test("round-trips one profile through the legacy wrapper and canonical key", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    saveActiveProfile({
      id: "bobby-foundation-fixture",
      codename: "Bobby",
      birthDate: "1990-09-17",
      lifePathNumber: 9,
    });

    const restored = loadActiveProfile();
    assert.strictEqual(restored?.id, "bobby-foundation-fixture");
    assert.strictEqual(restored?.birthDate, "1990-09-17");
    assert.strictEqual(restored?.lifePathNumber, 9);
    assert.strictEqual(restored?.schemaVersion, 1);
    assert.ok(localStorage.getItem("soulcodex.activeProfile.v1"));
  });

  await t.test("does not call a profile verified merely because time and location were entered", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    assert.strictEqual(deriveConfidenceState({
      birthDate: "1990-09-17",
      birthTime: "11:11",
      birthLocation: "Bronx, NY",
    }), "partial");
  });

  await t.test("rejects a copied profile-level verified label without placement evidence", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    assert.strictEqual(deriveConfidenceState({
      birthDate: "1990-09-17",
      confidence: { verificationStatus: "verified" },
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "pending_independent_verification" },
        moon: { sign: "Virgo", verificationStatus: "pending_independent_verification" },
        rising: { sign: "Scorpio", verificationStatus: "unresolved" },
      },
    }), "partial");
  });

  await t.test("requires evidence-complete verified placements for verified confidence", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    assert.strictEqual(deriveConfidenceState({
      birthDate: "1990-09-17",
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "verified", evidence },
        moon: { sign: "Virgo", verificationStatus: "verified", evidence },
        rising: { sign: "Scorpio", verificationStatus: "verified", evidence },
      },
    }), "verified");
  });

  await t.test("keeps pending populated placements partial", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    assert.strictEqual(deriveConfidenceState({
      birthDate: "1990-09-17",
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "pending_independent_verification", evidence },
        moon: { sign: "Virgo", verificationStatus: "pending_independent_verification", evidence },
        rising: { sign: "Scorpio", verificationStatus: "unresolved", evidence },
      },
    }), "partial");
  });

  await t.test("clears the shared profile for every consumer", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    saveActiveProfile({ birthDate: "1990-09-17" });
    clearActiveProfile();
    assert.strictEqual(loadActiveProfile(), null);
  });

  await t.test("Evidence Persistence Contract: survives astrology evidence through save/load cycle", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    const evidenceRecord = {
      source: "independent ephemeris comparison",
      engine: "engine-a+engine-b",
      calculatedAt: "2026-08-02T20:15:00Z",
    };

    const profileWithEvidence = {
      birthDate: "1990-09-17",
      astrologyData: {
        sun: {
          sign: "Virgo",
          verificationStatus: "verified" as const,
          evidence: evidenceRecord,
        },
        moon: {
          sign: "Capricorn",
          verificationStatus: "verified" as const,
          evidence: evidenceRecord,
        },
        rising: {
          sign: "Scorpio",
          verificationStatus: "verified" as const,
          evidence: evidenceRecord,
        },
      },
    };

    saveActiveProfile(profileWithEvidence);
    const restored = loadActiveProfile();

    assert.strictEqual(restored?.astrologyData?.sun?.sign, "Virgo");
    assert.strictEqual(restored?.astrologyData?.sun?.verificationStatus, "verified");
    assert.strictEqual(restored?.astrologyData?.sun?.evidence?.source, "independent ephemeris comparison");
    assert.strictEqual(restored?.astrologyData?.sun?.evidence?.engine, "engine-a+engine-b");
    assert.strictEqual(restored?.astrologyData?.moon?.evidence?.source, "independent ephemeris comparison");
  });

  await t.test("Evidence Persistence Contract: survives numerology evidence through save/load cycle", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    const numerologyEvidence = {
      source: "deterministic birth-date calculation",
      calculatedAt: "2026-08-02T20:15:00Z",
    };

    const profileWithNumerology = {
      birthDate: "1990-09-17",
      numerologyData: {
        lifePath: {
          number: 9,
          verificationStatus: "deterministic" as const,
          evidence: numerologyEvidence,
        },
        expression: {
          number: 8,
          verificationStatus: "deterministic" as const,
          evidence: numerologyEvidence,
        },
        soulUrge: {
          number: 7,
          verificationStatus: "deterministic" as const,
          evidence: numerologyEvidence,
        },
      },
    };

    saveActiveProfile(profileWithNumerology);
    const restored = loadActiveProfile();

    assert.strictEqual(restored?.numerologyData?.lifePath?.number, 9);
    assert.strictEqual(restored?.numerologyData?.lifePath?.verificationStatus, "deterministic");
    assert.strictEqual(restored?.numerologyData?.lifePath?.evidence?.source, "deterministic birth-date calculation");
    assert.strictEqual(restored?.numerologyData?.expression?.evidence?.source, "deterministic birth-date calculation");
  });

  await t.test("Evidence Persistence Contract: survives Human Design evidence through save/load cycle", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    const hdEvidence = {
      source: "user-submitted chart",
      calculatedAt: "2026-08-02T20:15:00Z",
    };

    const profileWithHD = {
      birthDate: "1990-09-17",
      birthTime: "14:30",
      birthLocation: "New York, NY",
      humanDesignData: {
        type: {
          text: "Generator",
          verificationStatus: "supported" as const,
          evidence: hdEvidence,
        },
        strategy: {
          text: "To Respond",
          verificationStatus: "supported" as const,
          evidence: hdEvidence,
        },
        authority: {
          text: "Sacral",
          verificationStatus: "supported" as const,
          evidence: hdEvidence,
        },
      },
    };

    saveActiveProfile(profileWithHD);
    const restored = loadActiveProfile();

    assert.strictEqual(restored?.humanDesignData?.type?.text, "Generator");
    assert.strictEqual(restored?.humanDesignData?.type?.verificationStatus, "supported");
    assert.strictEqual(restored?.humanDesignData?.type?.evidence?.source, "user-submitted chart");
    assert.strictEqual(restored?.humanDesignData?.strategy?.evidence?.source, "user-submitted chart");
  });

  await t.test("Evidence Persistence Contract: preserves evidence association with correct calculation", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    const sunEvidence = {
      source: "sun-specific ephemeris",
      calculatedAt: "2026-08-02T20:00:00Z",
    };
    const moonEvidence = {
      source: "moon-specific ephemeris",
      calculatedAt: "2026-08-02T20:15:00Z",
    };

    const profileWithDistinctEvidence = {
      birthDate: "1990-09-17",
      astrologyData: {
        sun: {
          sign: "Virgo",
          verificationStatus: "verified" as const,
          evidence: sunEvidence,
        },
        moon: {
          sign: "Capricorn",
          verificationStatus: "verified" as const,
          evidence: moonEvidence,
        },
      },
    };

    saveActiveProfile(profileWithDistinctEvidence);
    const restored = loadActiveProfile();

    assert.strictEqual(restored?.astrologyData?.sun?.evidence?.source, "sun-specific ephemeris");
    assert.strictEqual(restored?.astrologyData?.sun?.evidence?.calculatedAt, "2026-08-02T20:00:00Z");
    assert.strictEqual(restored?.astrologyData?.moon?.evidence?.source, "moon-specific ephemeris");
    assert.strictEqual(restored?.astrologyData?.moon?.evidence?.calculatedAt, "2026-08-02T20:15:00Z");
  });

  await t.test("Evidence Persistence Contract: evidence survives schema versioning validation", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    const profileWithEvidence = {
      id: "evidence-test-profile",
      birthDate: "1990-09-17",
      schemaVersion: 1,
      astrologyData: {
        sun: {
          sign: "Virgo",
          verificationStatus: "verified" as const,
          evidence: {
            source: "independent ephemeris comparison",
            engine: "engine-a+engine-b",
            calculatedAt: "2026-08-02T20:15:00Z",
          },
        },
      },
    };

    saveActiveProfile(profileWithEvidence);
    const restored = loadActiveProfile();

    assert.strictEqual(restored?.schemaVersion, 1);
    assert.ok(restored?.astrologyData?.sun?.evidence);
    assert.strictEqual(restored?.astrologyData?.sun?.evidence?.source, "independent ephemeris comparison");
  });

  await t.test("Evidence Persistence Contract: handles multiple evidence records across systems", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    const evidence = {
      source: "independent verification",
      calculatedAt: "2026-08-02T20:15:00Z",
    };

    const multiSystemProfile = {
      birthDate: "1990-09-17",
      astrologyData: {
        sun: {
          sign: "Virgo",
          verificationStatus: "verified" as const,
          evidence,
        },
      },
      numerologyData: {
        lifePath: {
          number: 9,
          verificationStatus: "deterministic" as const,
          evidence: { ...evidence, source: "birth-date calculation" },
        },
      },
      humanDesignData: {
        type: {
          text: "Generator",
          verificationStatus: "supported" as const,
          evidence: { ...evidence, source: "user-submitted" },
        },
      },
    };

    saveActiveProfile(multiSystemProfile);
    const restored = loadActiveProfile();

    assert.strictEqual(restored?.astrologyData?.sun?.evidence?.source, "independent verification");
    assert.strictEqual(restored?.numerologyData?.lifePath?.evidence?.source, "birth-date calculation");
    assert.strictEqual(restored?.humanDesignData?.type?.evidence?.source, "user-submitted");
  });
});
