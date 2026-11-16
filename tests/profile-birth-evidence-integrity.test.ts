import assert from "node:assert/strict";
import test from "node:test";
import { loadActiveProfile, saveActiveProfile } from "../client/src/lib/ActiveProfileRepository.ts";
import { loadOfflineProfile, saveOfflineProfile } from "../client/src/lib/offlineProfileStore.ts";
import { generateFoundationOfflineCodexProfile, repairStaleBirthEvidence } from "../client/src/lib/foundationOfflineCodex.ts";
import { birthEvidenceInput } from "../client/src/lib/profileBirthEvidence.ts";
import { profileNeedsOnlineVerification, reconcileActiveProfile, reconcileOfflineProfile } from "../client/src/lib/profileVerificationReconciliation.ts";

class MemoryStorage {
  values = new Map<string, string>();
  get length() { return this.values.size; }
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  clear() { this.values.clear(); }
}

const input = { name: "Avery Example", birthDate: "1986-01-14", birthTime: "12:00",
  birthLocation: "New York", timezone: "America/New_York", latitude: "40.7", longitude: "-74.0" };
const placement = (sign: string) => ({ sign, verificationStatus: "verified",
  evidence: { source: "test fixture only", engine: "test-reference", calculatedAt: "2026-11-16T12:00:00Z",
    inputTimestamp: "1986-01-14T17:00:00.000Z" } });
// Deliberately synthetic evidence to exercise input binding, not astronomical correctness.
const remote = { astrologyData: { sun: placement("Capricorn"), moon: placement("Virgo"), rising: placement("Aries"),
  houses: [{ house: 1, longitude: 0 }], aspects: [{ planet1: "sun", planet2: "moon", aspect: "trine" }] } };
const baseline = () => generateFoundationOfflineCodexProfile(input, { id: "local-birth-integrity", includeNameNumerology: false });
const current = () => reconcileOfflineProfile(baseline(), remote, "2026-11-16T12:00:00.000Z", input);
function storage() {
  Object.defineProperty(globalThis, "localStorage", { value: new MemoryStorage(), configurable: true });
}

test("canonical reload invalidates unbound legacy Aries and its dependent reading without editing birth inputs", () => {
  storage();
  const legacy = { ...baseline(), schemaVersion: 1, astrologyData: remote.astrologyData,
    risingSign: "Aries", biography: "Old Aries Rising story", dailyGuidance: "Old Aries advice",
    depthInterpretation: { summary: "Old Aries interpretation" }, personalityData: { assessment: "user answer" } };
  localStorage.setItem("soulcodex.activeProfile.v1", JSON.stringify(legacy));
  const result = loadActiveProfile().profile as any;
  assert.equal(result.id, legacy.id);
  for (const key of ["name", "birthDate", "birthTime", "birthLocation", "timezone", "latitude", "longitude"] as const) {
    assert.equal(result[key], legacy[key]);
  }
  assert.deepEqual(result.personalityData, legacy.personalityData);
  assert.equal(result.risingSign, null);
  assert.equal(result.astrologyData.risingSign, "");
  assert.deepEqual(result.astrologyData.houses, []);
  assert.deepEqual(result.astrologyData.aspects, []);
  assert.equal(result.humanDesignData, null);
  assert.equal(result.birthEvidenceInvalidation.reason, "legacy_evidence_requires_birth_input_verification");
  assert.doesNotMatch(JSON.stringify([result.biography, result.dailyGuidance, result.depthInterpretation, result.synthesis]), /Old Aries/);
  assert.deepEqual(loadActiveProfile().profile, JSON.parse(JSON.stringify(result)));
});

test("a response validated against the current request retains evidence across save and reload", () => {
  storage();
  const verified = reconcileActiveProfile(baseline(), remote, "2026-11-16T12:00:00.000Z", input);
  assert.ok(verified.birthEvidenceInput);
  assert.equal(saveActiveProfile(verified).success, true);
  assert.equal(loadActiveProfile().profile?.astrologyData.rising.sign, "Aries");
  assert.equal(loadActiveProfile().profile?.birthEvidenceInvalidation, undefined);
});

test("same-ID birth time or coordinate edit clears chart, HD, geometry and prose at canonical save", () => {
  for (const edit of [{ birthTime: "13:00" }, { latitude: "41.7" }, { longitude: "-73.0" }, { birthTimeStatus: "unknown" as const }]) {
    storage();
    const saved: any = { ...reconcileActiveProfile(baseline(), remote), ...edit,
      humanDesignData: { status: "verified", inputTimestampUtc: "1986-01-14T17:00:00Z" },
      biography: "Old Aries Rising story", synthesis: { summary: "Old Aries story" } };
    assert.equal(saveActiveProfile(saved).success, true);
    const restored = loadActiveProfile().profile as any;
    assert.equal(restored.id, saved.id);
    assert.equal(restored.risingSign, null);
    assert.equal(restored.humanDesignData, null);
    assert.equal(restored.verifiedAstrologyData, undefined);
    assert.deepEqual(restored.astrologyData.houses, []);
    assert.deepEqual(restored.astrologyData.aspects, []);
    assert.doesNotMatch(restored.biography, /Old Aries/);
    for (const [key, value] of Object.entries(edit)) assert.equal(restored[key], value);
  }
});

test("matching binding does not conceal a contradictory placement or HD input timestamp", () => {
  for (const override of [
    { verifiedAstrologyData: { ...remote.astrologyData, rising: { ...placement("Aries"), evidence: {
      ...placement("Aries").evidence, inputTimestamp: "1986-01-14T05:00:00Z" } } } },
    { humanDesignData: { status: "verified", inputTimestampUtc: "1986-01-14T05:00:00Z" } },
  ]) {
    const stored = { ...current(), ...override };
    const repaired = repairStaleBirthEvidence(stored) as any;
    assert.equal(repaired.verifiedAstrologyData, undefined);
    assert.equal(repaired.humanDesignData, null);
    assert.equal(profileNeedsOnlineVerification(repaired), true);
  }
});

test("offline persistence repairs legacy evidence and later coordinate edits without recreating the profile", async () => {
  storage();
  const legacy = { ...current(), birthEvidenceInput: undefined, biography: "Old Aries story" };
  localStorage.setItem(`soulcodex.offlineProfile.v1.${legacy.id}`, JSON.stringify(legacy));
  const restored = await loadOfflineProfile(legacy.id) as any;
  assert.equal(restored.id, legacy.id);
  assert.equal(restored.verifiedAstrologyData, undefined);
  assert.equal(profileNeedsOnlineVerification(restored), true);
  await saveOfflineProfile(current());
  assert.equal((await loadOfflineProfile(legacy.id) as any).verifiedAstrologyData.rising.sign, "Aries");
  await saveOfflineProfile({ ...current(), latitude: "41.7" });
  const edited = await loadOfflineProfile(legacy.id) as any;
  assert.equal(edited.latitude, "41.7");
  assert.equal(edited.verifiedAstrologyData, undefined);
});

test("old in-flight response cannot attach to changed inputs with the same profile ID", () => {
  const changed = { ...baseline(), birthTime: "13:00" };
  assert.throws(() => reconcileActiveProfile(changed, remote, undefined, input), /changed during verification/);
  assert.throws(() => reconcileOfflineProfile(changed, remote, undefined, input), /changed during verification/);
  const moved = { ...baseline(), longitude: "-73.0" };
  assert.throws(() => reconcileOfflineProfile(moved, remote, undefined, input), /changed during verification/);
  assert.throws(() => reconcileActiveProfile(baseline(), { ...remote, birthTime: "13:00" }), /different birth details/);
  assert.throws(() => reconcileOfflineProfile(changed, remote), /does not match/);
});

test("unknown-time range evidence is bound to the day and never keeps exact-time evidence", () => {
  const unknown = { ...baseline(), birthTime: null, birthTimeStatus: "unknown" as const };
  const response = { astrologyData: { sun: { sign: "Capricorn", evidenceState: "stable_across_range" as const },
    rising: { sign: null, verificationStatus: "unresolved" } } };
  const reconciled = reconcileOfflineProfile(unknown, response, undefined, unknown);
  assert.equal(reconciled.birthEvidenceInput?.mode, "unknown");
  assert.equal(repairStaleBirthEvidence(reconciled), reconciled);
  assert.throws(() => reconcileOfflineProfile(unknown, remote, undefined, unknown), /does not match/);
  assert.equal(repairStaleBirthEvidence(baseline()).birthEvidenceInvalidation, undefined);
});

test("numeric coordinate serialization does not invalidate matching evidence", () => {
  const saved = { ...current(), latitude: "40.7000", longitude: "-74" };
  assert.deepEqual(birthEvidenceInput(saved), birthEvidenceInput(input));
  assert.equal(repairStaleBirthEvidence(saved), saved);
});

test("legacy chart aliases cannot revive cleared evidence in compatibility or confidence", () => {
  storage();
  const legacy: any = { ...baseline(), schemaVersion: 1, astrology: remote.astrologyData, natalChart: remote.astrologyData,
    chart: remote.astrologyData, elements: { fire: 100 } };
  localStorage.setItem("soulcodex.activeProfile.v1", JSON.stringify(legacy));
  const loaded = loadActiveProfile().profile as any;
  for (const key of ["astrology", "natalChart", "chart", "elements"]) assert.equal(loaded[key], undefined);
  assert.deepEqual(loaded.astrologyData.planets, {});
});

test("malformed legacy fields stay accessible and unchanged while old chart evidence is cleared", async () => {
  for (const invalid of [{ birthTime: 123 }, { name: 123 }, { fullBirthName: { legacy: true } },
    { birthDate: { legacy: true } }, { timezone: 123 }, { latitude: { toString: 123 } }]) {
    storage();
    const raw: any = { ...current(), schemaVersion: 1, birthEvidenceInput: undefined, ...invalid };
    localStorage.setItem("soulcodex.activeProfile.v1", JSON.stringify(raw));
    const canonical = loadActiveProfile();
    assert.equal(canonical.status, "loaded");
    assert.ok(canonical.profile);
    const restored: any = canonical.profile;
    assert.equal(restored.id, raw.id);
    assert.equal(restored.verifiedAstrologyData, undefined);
    assert.equal(restored.birthEvidenceInput, undefined);
    for (const key of Object.keys(invalid)) assert.deepEqual(restored[key], raw[key]);
    localStorage.setItem(`soulcodex.offlineProfile.v1.${raw.id}`, JSON.stringify(raw));
    const offline: any = await loadOfflineProfile(raw.id);
    assert.ok(offline);
    assert.equal(offline.verifiedAstrologyData, undefined);
    assert.equal(offline.birthEvidenceInput, undefined);
    for (const key of Object.keys(invalid)) assert.deepEqual(offline[key], raw[key]);
  }
  assert.equal(birthEvidenceInput({ ...input, birthTime: 123 }), null);
  assert.equal(birthEvidenceInput({ ...input, latitude: { toString: 123 } }), null);
});
