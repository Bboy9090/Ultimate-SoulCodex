import { formatInTimeZone } from 'date-fns-tz';
import { parseDateOnly } from '@soulcodex/core';

// Biorhythms - Physical, Emotional, Intellectual Cycles

interface BiorhythmCycle {
  name: string;
  period: number; // days
  currentValue: number; // -100 to +100
  phase: "High" | "Low" | "Critical";
  daysUntilPeak: number;
  interpretation: string;
}

interface BiorhythmData {
  referenceDate: string;
  calculationBasis: "date-only-symbolic";
  physical: BiorhythmCycle;
  emotional: BiorhythmCycle;
  intellectual: BiorhythmCycle;
  overall: {
    energy: number; // -100 to +100
    bestDays: Date[];
    criticalDays: Date[];
    interpretation: string;
  };
}

function calculateCycle(daysSinceBirth: number, period: number): {
  value: number;
  phase: "High" | "Low" | "Critical";
  daysUntilPeak: number;
} {
  const angle = (2 * Math.PI * daysSinceBirth) / period;
  const value = Math.round(Math.sin(angle) * 100);
  
  // Determine phase
  let phase: "High" | "Low" | "Critical";
  if (Math.abs(value) < 5) phase = "Critical"; // Near zero crossing
  else if (value > 0) phase = "High";
  else phase = "Low";
  
  // Days until peak
  const currentPhase = daysSinceBirth % period;
  const peakPhase = period / 4;
  let daysUntilPeak = peakPhase - currentPhase;
  if (daysUntilPeak < 0) daysUntilPeak += period;
  
  return { value, phase, daysUntilPeak: Math.round(daysUntilPeak) };
}

function dateOnlyOrdinal(dateISO: string): number {
  const { year, month, day } = parseDateOnly(dateISO);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function referenceDateISO(currentDate: Date | string, timezone?: string): string {
  if (typeof currentDate === "string") {
    parseDateOnly(currentDate);
    return currentDate;
  }
  if (Number.isNaN(currentDate.getTime())) {
    throw new RangeError("Biorhythm current date must be valid");
  }
  return timezone
    ? formatInTimeZone(currentDate, timezone, "yyyy-MM-dd")
    : currentDate.toISOString().slice(0, 10);
}

export function calculateBiorhythms(
  birthDate: string,
  currentDate: Date | string = new Date(),
  timezone?: string,
): BiorhythmData {
  const referenceDate = referenceDateISO(currentDate, timezone);
  const daysSinceBirth = dateOnlyOrdinal(referenceDate) - dateOnlyOrdinal(birthDate);
  if (daysSinceBirth < 0) {
    throw new RangeError("Biorhythm reference date cannot precede birth date");
  }
  
  // Three primary cycles
  const PHYSICAL_PERIOD = 23;
  const EMOTIONAL_PERIOD = 28;
  const INTELLECTUAL_PERIOD = 33;
  
  const physical = calculateCycle(daysSinceBirth, PHYSICAL_PERIOD);
  const emotional = calculateCycle(daysSinceBirth, EMOTIONAL_PERIOD);
  const intellectual = calculateCycle(daysSinceBirth, INTELLECTUAL_PERIOD);
  
  // Calculate best and critical days in next 30 days
  const bestDays: Date[] = [];
  const criticalDays: Date[] = [];
  
  for (let i = 0; i < 30; i++) {
    const futureDate = new Date((dateOnlyOrdinal(referenceDate) + i) * 86_400_000);
    const futureDays = daysSinceBirth + i;
    
    const p = calculateCycle(futureDays, PHYSICAL_PERIOD);
    const e = calculateCycle(futureDays, EMOTIONAL_PERIOD);
    const int = calculateCycle(futureDays, INTELLECTUAL_PERIOD);
    
    const avgValue = (p.value + e.value + int.value) / 3;
    
    if (avgValue > 70) bestDays.push(futureDate);
    if (p.phase === "Critical" || e.phase === "Critical" || int.phase === "Critical") {
      criticalDays.push(futureDate);
    }
  }
  
  const overallEnergy = Math.round((physical.value + emotional.value + intellectual.value) / 3);
  
  return {
    referenceDate,
    calculationBasis: "date-only-symbolic",
    physical: {
      name: "Physical",
      period: PHYSICAL_PERIOD,
      currentValue: physical.value,
      phase: physical.phase,
      daysUntilPeak: physical.daysUntilPeak,
      interpretation: physical.phase === "High" 
        ? "Your physical energy is high. Great time for exercise, sports, and physical challenges."
        : physical.phase === "Low"
        ? "Physical energy is low. Focus on rest, recovery, and gentle activities."
        : "Critical day for physical cycle. Be cautious with strenuous activities."
    },
    emotional: {
      name: "Emotional",
      period: EMOTIONAL_PERIOD,
      currentValue: emotional.value,
      phase: emotional.phase,
      daysUntilPeak: emotional.daysUntilPeak,
      interpretation: emotional.phase === "High"
        ? "Emotional wellbeing is elevated. Good time for relationships and creative expression."
        : emotional.phase === "Low"
        ? "Emotional sensitivity is heightened. Practice self-care and introspection."
        : "Critical emotional day. Be mindful of mood swings and emotional reactions."
    },
    intellectual: {
      name: "Intellectual",
      period: INTELLECTUAL_PERIOD,
      currentValue: intellectual.value,
      phase: intellectual.phase,
      daysUntilPeak: intellectual.daysUntilPeak,
      interpretation: intellectual.phase === "High"
        ? "Mental clarity is sharp. Excellent for learning, problem-solving, and decisions."
        : intellectual.phase === "Low"
        ? "Mental energy is quieter. Good for reflection and intuitive processes."
        : "Critical intellectual day. Double-check important decisions and communications."
    },
    overall: {
      energy: overallEnergy,
      bestDays: bestDays.slice(0, 5),
      criticalDays: criticalDays.slice(0, 5),
      interpretation: `Your overall biorhythm energy is at ${overallEnergy}%. ${
        overallEnergy > 50 
          ? "You're in a high-energy phase across multiple cycles." 
          : overallEnergy < -50
          ? "You're in a recovery phase. Honor your need for rest."
          : "Your cycles are balanced. Navigate mindfully."
      }`
    }
  };
}
