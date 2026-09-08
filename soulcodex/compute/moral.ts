import type { PressureStyle } from "../types";

interface MoralCode {
  name: string;
  notes: string;
}

const PRESSURE_CODES: Record<PressureStyle, { name: string; base: string }> = {
  fight: {
    name: "The Enforcer",
    base: "I escalate when I detect a violation of fairness, regardless of the tension it creates.",
  },
  freeze: {
    name: "The Sentinel",
    base: "I prioritize observation over action when the environment is hostile, waiting for a clear signal.",
  },
  adapt: {
    name: "The Diplomat",
    base: "I mirror the needs of the environment to maintain momentum when a direct path is blocked.",
  },
  withdraw: {
    name: "The Watcher",
    base: "I pull my signal from the room the moment it becomes noisy, preserving my internal alignment.",
  },
  perform: {
    name: "The Standard-Bearer",
    base: "I increase my output when stakes are high, trading my health for the structural victory.",
  },
};

export function deriveMoralCode(
  pressureStyle: PressureStyle,
  nonNegotiables: string[]
): MoralCode {
  const entry = PRESSURE_CODES[pressureStyle] ?? PRESSURE_CODES.adapt;
  const top = nonNegotiables.slice(0, 2);
  const nonNegPart =
    top.length > 0
      ? ` I won't tolerate ${top.join(" or ")}.`
      : "";
  return {
    name: entry.name,
    notes: entry.base + nonNegPart,
  };
}
