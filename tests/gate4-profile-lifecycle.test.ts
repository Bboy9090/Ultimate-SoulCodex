import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import {
  clearActiveProfile,
  loadActiveProfile,
  saveActiveProfile,
} from "../client/src/lib/ActiveProfileRepository";

const store = new Map<string, string>();

const localStorageMock = {
  getItem(key: string) {
    return store.has(key) ? store.get(key)! : null;
  },
  setItem(key: string, value: string) {
    store.set(key, String(value));
  },
  removeItem(key: string) {
    store.delete(key);
  },
  clear() {
    store.clear();
  },
  key(index: number) {
    return Array.from(store.keys())[index] ?? null;
  },
  get length() {
    return store.size;
  },
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

beforeEach(() => {
  store.clear();
});

test("Gate 4: canonical profile survives save and reload with current schema", () => {
  const result = saveActiveProfile({
    birthDate: "1990-09-17",
    birthTime: "11:11",
    birthLocation: "Bronx, New York",
    sunSign: "Virgo",
  });
  assert.equal(result.success, true);

  const loaded = loadActiveProfile();
  assert.equal(loaded.status, "loaded");
  assert.equal(loaded.profile?.birthDate, "1990-09-17");
  assert.equal(loaded.profile?.schemaVersion, 1);
  assert.ok(loaded.profile?.createdAt);
  assert.ok(loaded.profile?.updatedAt);
});

test("Gate 4: malformed canonical state is corrupted, not missing", () => {
  localStorage.setItem("soulcodex.activeProfile.v1", "{broken-json");

  const loaded = loadActiveProfile();
  assert.equal(loaded.status, "corrupted");
  assert.equal(loaded.profile, null);
});

test("Gate 4: malformed canonical state cannot fall back to stale legacy profile", () => {
  localStorage.setItem("soulcodex.activeProfile.v1", "{broken-json");
  localStorage.setItem(
    "soulProfile",
    JSON.stringify({ birthDate: "1988-10-29", sunSign: "Scorpio" }),
  );

  const loaded = loadActiveProfile();
  assert.equal(loaded.status, "corrupted");
  assert.equal(loaded.profile, null);
  assert.equal(localStorage.getItem("soulcodex.activeProfile.v1"), "{broken-json");
});

test("Gate 4: unversioned legacy profile migrates exactly once to schema v1", () => {
  localStorage.setItem(
    "soulProfile",
    JSON.stringify({
      birthDate: "1990-09-17",
      birthTime: "11:11",
      sunSign: "Virgo",
    }),
  );

  const migrated = loadActiveProfile();
  assert.equal(migrated.status, "legacy-found");
  assert.equal(migrated.legacyKey, "soulProfile");
  assert.equal(migrated.profile?.schemaVersion, 1);
  assert.ok(migrated.profile?.createdAt);
  assert.ok(migrated.profile?.updatedAt);

  const reloaded = loadActiveProfile();
  assert.equal(reloaded.status, "loaded");
  assert.equal(reloaded.profile?.birthDate, "1990-09-17");
  assert.equal(reloaded.profile?.schemaVersion, 1);
});

test("Gate 4: raw onboarding form data is not promoted into a completed active profile", () => {
  localStorage.setItem(
    "onboardingData",
    JSON.stringify({
      name: "Form Only",
      birthDate: "1990-09-17",
      birthTime: "11:11",
      birthLocation: "Bronx, New York",
    }),
  );

  const loaded = loadActiveProfile();
  assert.equal(loaded.status, "missing");
  assert.equal(loaded.profile, null);
  assert.equal(localStorage.getItem("soulcodex.activeProfile.v1"), null);
  assert.notEqual(localStorage.getItem("onboardingData"), null);
});

test("Gate 4: explicitly incompatible legacy schema is not silently upgraded", () => {
  localStorage.setItem(
    "soulProfile",
    JSON.stringify({
      birthDate: "1990-09-17",
      schemaVersion: 999,
      sunSign: "Virgo",
    }),
  );

  const loaded = loadActiveProfile();
  assert.equal(loaded.status, "missing");
  assert.equal(loaded.profile, null);
  assert.equal(localStorage.getItem("soulcodex.activeProfile.v1"), null);
});

test("Gate 4: reset removes canonical, legacy, and onboarding sources so profile cannot resurrect", () => {
  assert.equal(saveActiveProfile({ birthDate: "1990-09-17" }).success, true);
  localStorage.setItem(
    "soulProfile",
    JSON.stringify({ birthDate: "1988-10-29", sunSign: "Scorpio" }),
  );
  localStorage.setItem(
    "soulCodexReading",
    JSON.stringify({ birthDate: "1993-07-26", sunSign: "Leo" }),
  );
  localStorage.setItem(
    "onboardingData",
    JSON.stringify({ birthDate: "2003-02-06", name: "Raw Form" }),
  );

  clearActiveProfile();

  assert.equal(localStorage.getItem("soulcodex.activeProfile.v1"), null);
  assert.equal(localStorage.getItem("soulProfile"), null);
  assert.equal(localStorage.getItem("soulCodexReading"), null);
  assert.equal(localStorage.getItem("onboardingData"), null);

  const loaded = loadActiveProfile();
  assert.equal(loaded.status, "missing");
  assert.equal(loaded.profile, null);
});
