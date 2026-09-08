import type { ContradictionRules, TraitSignal } from "./types.js";

export function applyContradictionRules(input: TraitSignal[], rules: ContradictionRules): TraitSignal[] {
  if (!rules?.rules?.length) return input;

  const present = new Set(input.map((s) => s.trait_key));
  const blocked = new Set<string>();

  for (const r of rules.rules) {
    const allPresent = r.if_all_present.every((k) => present.has(k));
    if (!allPresent) continue;
    for (const b of r.block) blocked.add(b);
  }

  if (!blocked.size) return input;
  return input.filter((s) => !blocked.has(s.trait_key));
}

