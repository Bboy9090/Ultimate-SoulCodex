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

test("local active snapshot refreshes stale prose while preserving chart aliases and assessments", () => {
  Object.defineProperty(globalThis, "localStorage", { value: new MemoryStorage(), configurable: true });
  const astrologyData = { sunSign: "Capricorn", planets: { sun: { sign: "Capricorn", verificationStatus: "verified", evidence } } };
  const assessmentMetadata = { answers: ["a private answer"] };
  localStorage.setItem("soulcodex.activeProfile.v1", JSON.stringify({
    id: "local-prose-refresh", name: "Avery Cole", fullBirthName: "Avery Cole",
    birthDate: "1986-01-14", birthTime: "12:00", birthTimeStatus: "unknown",
    birthLocation: "Bronx, New York", timezone: "America/New_York", schemaVersion: 1,
    createdAt: "2026-09-01T00:00:00Z", astrologyData, assessmentMetadata,
    biography: "Everyone has discernment and Life Path 9.", numerologyData: { lifePath: 9 },
  }));
  const refreshed = loadActiveProfile() as any;
  assert.ok(refreshed);
  assert.notEqual(refreshed.biography, "Everyone has discernment and Life Path 9.");
  assert.notEqual(refreshed.numerologyData.lifePath, 9);
  assert.equal(refreshed.birthTimeStatus, "unknown");
  assert.deepEqual(refreshed.astrologyData, astrologyData);
  assert.deepEqual(refreshed.assessmentMetadata, assessmentMetadata);
  assert.equal(refreshed.createdAt, "2026-09-01T00:00:00Z");
  assert.equal(refreshed.fullBirthName, "Avery Cole");
  assert.deepEqual(refreshed.synthesis, refreshed.depthInterpretation);
  assert.deepEqual(loadActiveProfile(), refreshed);
});

test("server active snapshots never enter the local narrative migration", () => {
  Object.defineProperty(globalThis, "localStorage", { value: new MemoryStorage(), configurable: true });
  saveActiveProfile({ id: "remote-123", name: "Avery Cole", birthDate: "1986-01-14",
    birthLocation: "Bronx, New York", timezone: "America/New_York", synthesis: { custom: true } });
  const restored = loadActiveProfile();
  assert.deepEqual(restored?.synthesis, { custom: true });
  assert.equal(restored?.foundationNarrativeRevision, undefined);
});

test("local narrative refresh defers when an existing reading carries user behavioral evidence", () => {
  Object.defineProperty(globalThis, "localStorage", { value: new MemoryStorage(), configurable: true });
  const synthesis = { evidence: [{ id: "assessment-1", system: "user-stated", value: "Observed behavior" }] };
  saveActiveProfile({ id: "local-assessed", name: "Avery Cole", birthDate: "1986-01-14",
    birthLocation: "Bronx, New York", timezone: "America/New_York", synthesis });
  const restored = loadActiveProfile();
  assert.deepEqual(restored?.synthesis, synthesis);
  assert.equal(restored?.foundationNarrativeRevision, undefined);
});

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

  await t.test("canonical save downgrades verified astrology labels that lack provenance", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });

    saveActiveProfile({
      birthDate: "1990-09-17",
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "verified" },
        moon: { sign: "Cancer", status: "verified" },
        rising: { sign: null, verificationStatus: "verified" },
        planets: {
          mercury: { sign: "Libra", verificationStatus: "verified" },
        },
      },
    });

    const restored = loadActiveProfile();
    assert.strictEqual(restored?.astrologyData?.sun?.verificationStatus, "pending_independent_verification");
    assert.strictEqual(restored?.astrologyData?.moon?.status, "pending_independent_verification");
    assert.strictEqual(restored?.astrologyData?.rising?.verificationStatus, "unresolved");
    assert.strictEqual(restored?.astrologyData?.planets?.mercury?.verificationStatus, "pending_independent_verification");
  });

  await t.test("canonical save downgrades Human Design verified status without trust receipt", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });

    saveActiveProfile({
      birthDate: "1990-09-17",
      humanDesignData: {
        status: "verified",
        type: "Reflector",
        strategy: "To Wait a Lunar Cycle",
        authority: "Lunar Authority",
        profile: "2/5",
      },
    });

    const restored = loadActiveProfile();
    assert.strictEqual(restored?.humanDesignData?.status, "calculated_unverified");
  });

  await t.test("canonical save preserves Human Design verified status with complete trust receipt", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });

    const humanDesignData = {
      status: "verified",
      type: "Reflector",
      strategy: "To Wait a Lunar Cycle",
      authority: "Lunar Authority",
      profile: "2/5",
      engine: "soulcodex-hd-geocentric-v1",
      source: "Soul Codex deterministic Human Design core engine",
      calculatedAt: "2026-09-26T18:00:00.000Z",
      inputTimestampUtc: "1990-09-17T15:11:00.000Z",
      verificationReceiptId: "35474994858:human-design-repair-audit",
      independentSource: "free-human-design@1.0.1 differential verifier",
      verifiedAt: "2026-09-19T23:03:08.000Z",
    };

    saveActiveProfile({ birthDate: "1990-09-17", humanDesignData });
    const restored = loadActiveProfile();
    assert.strictEqual(restored?.humanDesignData?.status, "verified");
    assert.strictEqual(restored?.humanDesignData?.verificationReceiptId, humanDesignData.verificationReceiptId);
  });

  await t.test("canonical save rejects malformed verification timestamps", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });

    saveActiveProfile({
      birthDate: "1990-09-17",
      astrologyData: {
        sun: {
          sign: "Virgo",
          verificationStatus: "verified",
          evidence: { source: "reference", engine: "engine", calculatedAt: "not-a-date" },
        },
      },
      humanDesignData: {
        status: "verified",
        type: "Reflector",
        engine: "soulcodex-hd-geocentric-v1",
        source: "Soul Codex deterministic Human Design core engine",
        calculatedAt: "not-a-date",
        inputTimestampUtc: "1990-09-17T15:11:00.000Z",
        verificationReceiptId: "receipt",
        independentSource: "reference",
        verifiedAt: "2026-09-19T23:03:08.000Z",
      },
    });

    const restored = loadActiveProfile();
    assert.strictEqual(restored?.astrologyData?.sun?.verificationStatus, "pending_independent_verification");
    assert.strictEqual(restored?.humanDesignData?.status, "calculated_unverified");
  });

  await t.test("canonical save preserves verified astrology when provenance is complete", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });

    saveActiveProfile({
      birthDate: "1990-09-17",
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "verified", evidence },
      },
    });

    const restored = loadActiveProfile();
    assert.strictEqual(restored?.astrologyData?.sun?.verificationStatus, "verified");
    assert.deepEqual(restored?.astrologyData?.sun?.evidence, evidence);
  });

  await t.test("malformed placement timestamps cannot produce verified confidence", () => {
    assert.strictEqual(deriveConfidenceState({
      birthDate: "1990-09-17",
      astrologyData: {
        sun: {
          sign: "Virgo",
          verificationStatus: "verified",
          evidence: { source: "reference", engine: "engine", calculatedAt: "not-a-date" },
        },
        moon: {
          sign: "Cancer",
          verificationStatus: "verified",
          evidence: { source: "reference", engine: "engine", calculatedAt: "not-a-date" },
        },
        rising: {
          sign: "Scorpio",
          verificationStatus: "verified",
          evidence: { source: "reference", engine: "engine", calculatedAt: "not-a-date" },
        },
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
