import assert from "node:assert/strict";
import test from "node:test";
import { loadActiveProfile } from "../ActiveProfileRepository";

test("active profile load repairs and persists timezone-shifted Life Path 8", () => {
  const store = new Map<string, string>();
  store.set(
    "soulcodex.activeProfile.v1",
    JSON.stringify({
      birthDate: "1990-09-17",
      lifePathNumber: 8,
      numerologyData: { lifePath: 8, expression: 4 },
      schemaVersion: 1,
    }),
  );

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    },
  });

  const result = loadActiveProfile();
  const persisted = JSON.parse(store.get("soulcodex.activeProfile.v1") ?? "{}");

  assert.equal(result.status, "loaded");
  assert.equal(result.profile?.lifePathNumber, 9);
  assert.deepEqual(result.profile?.numerologyData, { lifePath: 9, expression: 4 });
  assert.equal(persisted.lifePathNumber, 9);
  assert.equal(persisted.numerologyData.lifePath, 9);
});
