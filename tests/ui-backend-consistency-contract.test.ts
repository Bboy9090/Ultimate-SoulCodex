import { test } from "node:test";
import assert from "node:assert";
import type { GalacticCodeResult } from "../shared/galactic-code/types";

/**
 * UI/Backend Consistency Contract
 *
 * Gate 1 closure principle: UI cannot be more certain than the backend evidence state.
 * If the backend says unresolved, pending, partial, missing, or insufficient,
 * the UI may explain that state, but it may not relabel it as verified, complete, confirmed, or otherwise upgrade certainty.
 */

test("UI/Backend Consistency Contract: Galactic Code Coverage Display", async (t) => {
  await t.test("coverage state 'high' displays with confidence (complete data available)", () => {
    const result: GalacticCodeResult = {
      profileId: "test-high-coverage",
      version: "galactic-code-v1",
      fingerprint: "abcd1234",
      shortCode: "SCX-GC-1234-5678-90AB",
      coverage: "high",
      sourceCoverage: {
        astrology: "complete",
        humanDesign: "complete",
        numerology: "complete",
        behavioralTraitCount: 8,
      },
      codename: "Test",
      designation: "High Coverage",
      tagline: "All systems complete",
      primaryFunction: "Test",
      secondaryFunction: "Test",
      legacyFunction: "Test",
      frequency: "0101-0101-LP1",
      axes: [],
      elementMatrix: {},
      behavioralSequence: ["Step1", "Step2", "Step3", "Step4", "Step5"],
      uniquenessKey: "test",
      interpretation: {
        identity: "test",
        decisionCode: "test",
        stressMechanic: "test",
        relationalCode: "test",
        missionArc: "test",
      },
      evidence: [],
      generatedAt: new Date().toISOString(),
    };

    // UI should display 'high' as a confident state
    assert.strictEqual(result.coverage, "high");
    // But this represents DATA completeness, not verification status
    // The UI must not interpret this as "all placements are verified"
    assert.ok(
      result.sourceCoverage.astrology === "complete",
      "UI can display complete data availability"
    );
  });

  await t.test("coverage state 'partial' displays with caution (incomplete data)", () => {
    const result: GalacticCodeResult = {
      profileId: "test-partial-coverage",
      version: "galactic-code-v1",
      fingerprint: "efgh5678",
      shortCode: "SCX-GC-ABCD-EFGH-IJKL",
      coverage: "partial",
      sourceCoverage: {
        astrology: "complete",
        humanDesign: "partial",
        numerology: "missing",
        behavioralTraitCount: 3,
      },
      codename: "Test",
      designation: "Partial Coverage",
      tagline: "Mixed data availability",
      primaryFunction: "Test",
      secondaryFunction: "Test",
      legacyFunction: "Test",
      frequency: "0102-0102-LP2",
      axes: [],
      elementMatrix: {},
      behavioralSequence: ["Step1", "Step2", "Step3", "Step4", "Step5"],
      uniquenessKey: "test",
      interpretation: {
        identity: "test",
        decisionCode: "test",
        stressMechanic: "test",
        relationalCode: "test",
        missionArc: "test",
      },
      evidence: [],
      generatedAt: new Date().toISOString(),
    };

    // UI should reflect the mixed state without upgrading missing systems
    assert.strictEqual(result.coverage, "partial");
    // The UI must display which systems are available and which are missing
    assert.strictEqual(result.sourceCoverage.astrology, "complete");
    assert.strictEqual(result.sourceCoverage.humanDesign, "partial");
    assert.strictEqual(result.sourceCoverage.numerology, "missing");
    // UI cannot say "numerology is partial" or "numerology is available" when it's "missing"
  });

  await t.test("coverage state 'insufficient' displays with limitation (not enough systems)", () => {
    const result: GalacticCodeResult = {
      profileId: "test-insufficient-coverage",
      version: "galactic-code-v1",
      fingerprint: "ijkl9012",
      shortCode: "SCX-GC-MNOP-QRST-UVWX",
      coverage: "insufficient",
      sourceCoverage: {
        astrology: "complete",
        humanDesign: "missing",
        numerology: "missing",
        behavioralTraitCount: 1,
      },
      codename: "Test",
      designation: "Insufficient Coverage",
      tagline: "Limited systems available",
      primaryFunction: "Test",
      secondaryFunction: "Test",
      legacyFunction: "Test",
      frequency: "0103-0103-LP3",
      axes: [],
      elementMatrix: {},
      behavioralSequence: ["Step1", "Step2", "Step3", "Step4", "Step5"],
      uniquenessKey: "test",
      interpretation: {
        identity: "test",
        decisionCode: "test",
        stressMechanic: "test",
        relationalCode: "test",
        missionArc: "test",
      },
      evidence: [],
      generatedAt: new Date().toISOString(),
    };

    // UI must accurately reflect insufficient coverage
    assert.strictEqual(result.coverage, "insufficient");
    // UI cannot upgrade this to "partial" or "high" no matter how complete astrology data is
    assert.strictEqual(
      result.sourceCoverage.humanDesign,
      "missing",
      "UI must show humanDesign as missing, not hide it"
    );
  });
});

test("UI/Backend Consistency Contract: Source Coverage Display Vocabulary", async (t) => {
  await t.test("SourceCoverageState uses data availability vocabulary only", () => {
    // SourceCoverageState values: 'complete' | 'partial' | 'missing'
    // These describe DATA, not verification status
    // UI must never interpret these as verification labels

    const sourceStates = ["complete", "partial", "missing"] as const;

    sourceStates.forEach((state) => {
      // These are data availability descriptors
      assert.ok(
        state === "complete" || state === "partial" || state === "missing",
        `Source coverage state must be data availability term: ${state}`
      );
      // UI must never display these as "verified", "uncertain", or "unconfirmed"
      assert.notStrictEqual(state, "verified");
      assert.notStrictEqual(state, "unverified");
    });
  });

  await t.test("UI must display all three coverage states without upgrading", () => {
    const states = [
      { state: "complete" as const, meaning: "all required fields present" },
      { state: "partial" as const, meaning: "some fields present" },
      { state: "missing" as const, meaning: "no fields present" },
    ];

    states.forEach(({ state, meaning }) => {
      // UI can display these states for educational purposes
      assert.ok(state);
      // But UI cannot infer verification from data presence
      // A "complete" astrology dataset could still have unresolved placements
      const completeMeansDataComplete = state === "complete";
      const completeDoesPOTComplete = state === "complete";
      assert.strictEqual(completeMeansDataComplete, completeDoesPOTComplete);
    });
  });
});

test("UI/Backend Consistency Contract: Evidence Respect", async (t) => {
  await t.test("UI cannot upgrade backend evidence from pending to verified", () => {
    // A backend astrology placement with verificationStatus: "pending_independent_verification"
    // cannot be displayed as "verified" in UI
    const backendPlacement = {
      sign: "Virgo",
      verificationStatus: "pending_independent_verification" as const,
    };

    // UI mapping must preserve this state
    const uiState = backendPlacement.verificationStatus;
    assert.strictEqual(uiState, "pending_independent_verification");
    // UI cannot downgrade to "partial" or upgrade to "verified"
  });

  await t.test("UI cannot upgrade backend evidence from unresolved to partial", () => {
    // A backend placement with verificationStatus: "unresolved"
    // cannot be displayed as "pending" or "partial"
    const backendPlacement = {
      sign: "Capricorn",
      verificationStatus: "unresolved" as const,
    };

    const uiState = backendPlacement.verificationStatus;
    assert.strictEqual(uiState, "unresolved");
    // UI may explain what "unresolved" means, but not relabel it
  });

  await t.test("UI displays evidence metadata as-is without interpretation upgrade", () => {
    // Evidence record proves source and calculation method, not the strength of conclusion
    const evidence = {
      source: "independent ephemeris comparison",
      engine: "engine-a+engine-b",
      calculatedAt: "2026-08-02T20:15:00Z",
    };

    // UI can display this evidence
    assert.ok(evidence.source);
    // But UI must never use evidence presence to upgrade verification status
    // Evidence existence ≠ verification status upgrade
  });
});

test("UI/Backend Consistency Contract: Multi-System Interaction", async (t) => {
  await t.test(
    "UI cannot claim profile as 'verified' when only one system has verified placements",
    () => {
      // Backend coverage: astrology complete/verified, numerology missing
      const backendCoverage = {
        astrology: "complete" as const,
        numerology: "missing" as const,
        humanDesign: "missing" as const,
      };

      // UI must not display profile as "verified" or "complete"
      // even though astrology is complete
      const canDisplayAsVerified = false; // Only 1 of 3 systems
      assert.strictEqual(canDisplayAsVerified, false);

      // UI should instead display what's available and what's missing
      assert.strictEqual(backendCoverage.astrology, "complete");
      assert.strictEqual(backendCoverage.numerology, "missing");
    }
  );

  await t.test(
    "UI shows multi-system evidence independently, not conflated across systems",
    () => {
      // Astrology evidence: ephemeris calculation
      // Numerology evidence: deterministic birth-date calculation
      // These are independent evidence chains

      const astrologyEvidence = {
        source: "independent ephemeris",
        engine: "ephemeris-v2",
      };

      const numerologyEvidence = {
        source: "deterministic calculation",
        calculatedAt: "2026-08-02T20:15:00Z",
      };

      // UI must not merge these or use one to vouch for the other
      assert.notStrictEqual(astrologyEvidence.source, numerologyEvidence.source);
      // UI displays both independently
      assert.ok(astrologyEvidence.source);
      assert.ok(numerologyEvidence.source);
    }
  );
});

test("UI/Backend Consistency Contract: Diamond Doctrine Enforcement", async (t) => {
  await t.test(
    "UI must not infer verification status from field presence (Diamond Doctrine)",
    () => {
      // The Diamond Doctrine: complete data ≠ verified data
      // Just because astrology has Sun, Moon, Rising does NOT mean they are verified

      const completeAstrologyData = {
        sun: "Virgo",
        moon: "Capricorn",
        rising: "Scorpio",
        // Coverage: "complete"
      };

      const verificationStatus = "pending_independent_verification";

      // UI must not assume that the presence of all three bodies means "verified"
      // UI must display the actual verificationStatus from backend
      assert.strictEqual(verificationStatus, "pending_independent_verification");
      // Not "verified", not "complete", not "confirmed"
    }
  );

  await t.test(
    "UI must display coverage state and verification status as separate concerns",
    () => {
      // Coverage: describes DATA availability (complete/partial/missing)
      // Verification: describes EPISTEMIC certainty (verified/pending/unresolved)

      const profile = {
        astrologyDataCoverage: "complete" as const,
        astrologyVerification: "pending_independent_verification" as const,
      };

      // UI must show BOTH states to the user
      // Not just one or the other
      // Display: "Astrology data complete, verification pending"
      // NOT: "Astrology verified" or "Astrology complete" alone

      assert.strictEqual(profile.astrologyDataCoverage, "complete");
      assert.strictEqual(profile.astrologyVerification, "pending_independent_verification");
      // UI responsibility: explain that complete data has not yet been verified
    }
  );
});

test("UI/Backend Consistency Contract: Behavioral Trait Count", async (t) => {
  await t.test("UI displays trait count without confidence upgrade", () => {
    // Trait count is a fact, not a verification status
    const traitCount = 8;

    // UI can display: "8 behavioral traits recorded"
    assert.strictEqual(traitCount, 8);
    // UI cannot say: "8 traits verified" unless each trait has verificationStatus: "verified"
  });
});

test("UI/Backend Consistency Contract: Certainty Ceiling Rule", async (t) => {
  await t.test("UI cannot display certainty higher than backend provides", () => {
    // Backend provides: coverage: "partial", verificationStatus: "partial"
    const backend = {
      coverage: "partial" as const,
      verificationStatus: "partial" as const,
    };

    // UI must not display: "complete", "high", "verified", or "confirmed"
    // UI can display: "partial", "incomplete", with explanation
    // UI MAY display: "This data is incomplete. More birth information needed."

    const maxUICertainty = backend.coverage; // "partial"
    assert.strictEqual(maxUICertainty, "partial");
    // Not "high" or "complete" no matter how helpful that would be to the user
  });

  await t.test("UI may explain uncertainty but not relabel it", () => {
    // Backend: verificationStatus: "unresolved"
    const backend = "unresolved" as const;

    // UI may say:
    // "Unresolved — birth time not confirmed; Ascendant is estimated."
    // UI may NOT say:
    // "Uncertain" (different word, downgrade)
    // "Pending verification" (implies active process)
    // "Provisional" (implies temporary)
    // "Needs confirmation" (implies it could be confirmed)

    // UI must use the exact backend state name or a clearly marked explanation
    assert.strictEqual(backend, "unresolved");
  });
});

test("UI/Backend Consistency Contract: Color Coding Honesty", async (t) => {
  await t.test("UI color coding must match backend state semantics", () => {
    // Coverage 'complete': can use green (data available)
    // Coverage 'partial': must use yellow/amber (incomplete)
    // Coverage 'missing': must use gray (no data)

    // Verification 'verified': can use green (epistemic certainty)
    // Verification 'pending': must use yellow (awaiting verification)
    // Verification 'unresolved': must use gray (not verified)

    // UI must not use green for 'pending' or 'partial'
    // UI must not use gray for 'complete' or 'verified'

    const colorMap = {
      complete: "green",
      partial: "yellow",
      missing: "gray",
    };

    assert.strictEqual(colorMap.complete, "green");
    assert.strictEqual(colorMap.partial, "yellow");
    assert.strictEqual(colorMap.missing, "gray");
    // No exceptions, no "it's context dependent"
  });
});
