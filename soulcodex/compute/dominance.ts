import type { SoulSignals } from "../types";

export interface CoreDriver {
  name: string;
  archetype: string;
  sources: string[];
  intensity: "high" | "medium" | "low";
  explanation: string;
}

/**
 * Layer 3: Dominance Engine
 *
 * Extracts and ranks Core Drivers — the archetypal forces that actually drive
 * behavior across all personality systems. NOT about personality traits, but
 * about the structural forces that shape decisions, reactions, and life patterns.
 *
 * A Core Driver is:
 * - Backed by multiple systems (not isolated)
 * - Observable in behavior (not theoretical)
 * - Actionable for self-understanding
 */

function extractCoreDrivers(s: SoulSignals): CoreDriver[] {
  const drivers: CoreDriver[] = [];

  // Life Path drivers (archetypal direction)
  if (s.lifePath === 1) {
    drivers.push({
      name: "Initiator",
      archetype: "The Pioneer",
      sources: ["Life Path 1"],
      intensity: "high",
      explanation: `You are built to clear paths that don't yet exist. Initiation is not a choice — it's your operating system. You move before consensus, create before permission, and lead by example.`
    });
  }

  if (s.lifePath === 4) {
    drivers.push({
      name: "Builder",
      archetype: "The Architect",
      sources: ["Life Path 4"],
      intensity: "high",
      explanation: `You build systems when chaos arises. Structure is how you think. You demand a foundation before you move, refuse hollow ideas, and organize disorder into something you can scale.`
    });
  }

  if (s.lifePath === 9) {
    drivers.push({
      name: "Closer",
      archetype: "The Alchemist",
      sources: ["Life Path 9"],
      intensity: "high",
      explanation: `You extract wisdom at the end of cycles. You see the exit before the entrance. You finish stories others leave open, positioning yourself to wrap up what is no longer serving.`
    });
  }

  // Sun sign drivers (expression style)
  if (["Virgo", "Capricorn", "Taurus"].includes(s.sunSign)) {
    drivers.push({
      name: "Analyzer",
      archetype: "The Auditor",
      sources: [s.sunSign + " Sun"],
      intensity: "high",
      explanation: `You map every move before you take it. You audit details others miss, fix the structure, and demand precision over momentum. Your superpower is seeing the gaps; your trap is never letting anything feel finished.`
    });
  }

  if (["Leo", "Sagittarius", "Aries"].includes(s.sunSign)) {
    drivers.push({
      name: "Performer",
      archetype: "The Catalyst",
      sources: [s.sunSign + " Sun"],
      intensity: "high",
      explanation: `You operate with intensity when there's an audience. You over-perform under pressure, trade internal peace for external validation, and lead through presence. Your visibility is your leverage.`
    });
  }

  if (["Scorpio", "Pisces", "Cancer"].includes(s.sunSign)) {
    drivers.push({
      name: "Perceiver",
      archetype: "The Sentinel",
      sources: [s.sunSign + " Sun"],
      intensity: "high",
      explanation: `You monitor the hidden layers of the room. You wait for the real truth to surface, ignore surface-level noise, and choose your words so carefully that timing becomes your primary constraint.`
    });
  }

  // Decision style drivers
  if (s.decisionStyle?.includes("impulse")) {
    drivers.push({
      name: "Reactor",
      archetype: "The Intuitive",
      sources: ["Impulse Decision Style"],
      intensity: "high",
      explanation: `Your gut is your authority. You trust instinct over analysis, move before you fully understand, and correct course mid-flight. Your speed is your superpower; your blindspot is information you skip in pursuit of action.`
    });
  }

  if (s.decisionStyle?.includes("analysis")) {
    drivers.push({
      name: "Analyst",
      archetype: "The Scholar",
      sources: ["Analysis Decision Style"],
      intensity: "high",
      explanation: `You check the logic before committing. You need the full picture before moving, verify before trusting, and prioritize correctness over speed. Your thoroughness protects against costly mistakes.`
    });
  }

  if (s.decisionStyle?.includes("consensus")) {
    drivers.push({
      name: "Diplomat",
      archetype: "The Connector",
      sources: ["Consensus Decision Style"],
      intensity: "medium",
      explanation: `You navigate through others. Your decisions are shaped by what serves the group, you prioritize harmony over solo truth, and you move when the room is ready. Your gift is cohesion; your trap is losing your own signal.`
    });
  }

  // Pressure style drivers
  if (s.pressureStyle?.includes("fight")) {
    drivers.push({
      name: "Combatant",
      archetype: "The Warrior",
      sources: ["Fight Pressure Style"],
      intensity: "high",
      explanation: `You confront obstacles directly. You escalate under pressure, push harder when blocked, and resolve conflict through engagement. Your willingness to fight is both your strength and your blindspot to when surrender is strategic.`
    });
  }

  if (s.pressureStyle?.includes("withdraw")) {
    drivers.push({
      name: "Reflector",
      archetype: "The Hermit",
      sources: ["Withdraw Pressure Style"],
      intensity: "high",
      explanation: `You need silence to recalibrate. Under pressure, you retreat to process, protect your signal through isolation, and resurface when you've integrated the shock. Others often misread your withdrawal as rejection.`
    });
  }

  if (s.pressureStyle?.includes("adapt")) {
    drivers.push({
      name: "Flexor",
      archetype: "The Chameleon",
      sources: ["Adapt Pressure Style"],
      intensity: "medium",
      explanation: `You shift the surface to keep the system stable. You change shape, move with the pressure instead of against it, and preserve continuity by bending first. Your flexibility is your gift; your trap is losing yourself in the bend.`
    });
  }

  // Social energy drivers
  if (s.socialEnergy?.includes("steady")) {
    drivers.push({
      name: "Anchor",
      archetype: "The Stabilizer",
      sources: ["Steady Social Energy"],
      intensity: "medium",
      explanation: `You show up with predictable consistency. You stabilize your circle even when your signal is fluctuating, provide the steady presence others rely on, and move like the tide — constant, reliable, subtle.`
    });
  }

  if (s.socialEnergy?.includes("bursts")) {
    drivers.push({
      name: "Cycler",
      archetype: "The Pulse",
      sources: ["Bursts Social Energy"],
      intensity: "high",
      explanation: `You operate in high-intensity cycles. You give everything until you hit a wall, then vanish without warning. Your seasons are real; others often mistake your cycles for personal rejection rather than your operating rhythm.`
    });
  }

  // Stress element drivers
  const stressDrivers: Record<string, CoreDriver> = {
    fire: {
      name: "Igniter",
      archetype: "The Flame",
      sources: ["Fire Stress Element"],
      intensity: "high",
      explanation: `Under stress, you ignite. Your signal becomes louder, your intensity peaks, you're willing to burn down what's not working. Your fire purifies but can also consume — including yourself.`
    },
    water: {
      name: "Absorber",
      archetype: "The Ocean",
      sources: ["Water Stress Element"],
      intensity: "high",
      explanation: `Under stress, you absorb. You take in the emotional weather, reflect what you sense, and drown if you don't eventually release the pressure. Your depth is your gift; your capacity to absorb can become your undoing.`
    },
    earth: {
      name: "Settler",
      archetype: "The Ground",
      sources: ["Earth Stress Element"],
      intensity: "medium",
      explanation: `Under stress, you settle. You drop into the physical, slow down, and stabilize through grounding. You become unmovable, which protects you but can also trap you in stasis.`
    },
    air: {
      name: "Messenger",
      archetype: "The Wind",
      sources: ["Air Stress Element"],
      intensity: "medium",
      explanation: `Under stress, you communicate. You talk it out, think through articulation, process by expressing. Your words flow but sometimes scatter before landing.`
    },
    metal: {
      name: "Refiner",
      archetype: "The Alchemist",
      sources: ["Metal Stress Element"],
      intensity: "medium",
      explanation: `Under stress, you refine. You sharpen your edges, pare down to essence, and cut away what's not serving. Your precision is powerful; your sharpness can wound.`
    }
  };

  if (s.stressElement?.[0] && stressDrivers[s.stressElement[0]]) {
    drivers.push(stressDrivers[s.stressElement[0]]);
  }

  return drivers;
}

export function rankCoreDrivers(s: SoulSignals): CoreDriver[] {
  const drivers = extractCoreDrivers(s);

  // Sort by: intensity (high > medium > low), then by sources (more backing = higher rank)
  drivers.sort((a, b) => {
    const intensityOrder = { high: 0, medium: 1, low: 2 };
    if (intensityOrder[a.intensity] !== intensityOrder[b.intensity]) {
      return intensityOrder[a.intensity] - intensityOrder[b.intensity];
    }
    return b.sources.length - a.sources.length;
  });

  return drivers;
}

/**
 * Build a ranked, readable summary of Core Drivers for the user.
 * This becomes the "three things that drive you" narrative.
 */
export function buildDominanceSummary(drivers: CoreDriver[]): string {
  if (drivers.length === 0) return "Your Core Drivers are not yet clear.";

  const top3 = drivers.slice(0, 3);
  const descriptions = top3.map((d, i) => `${i + 1}. **${d.name}** (${d.archetype}): ${d.explanation}`);

  return descriptions.join("\n\n");
}
