// Ayurveda - Dosha Constitution (Prakruti) System

interface Dosha {
  name: "Vata" | "Pitta" | "Kapha";
  elements: string[];
  qualities: string[];
  traits: {
    physical: string[];
    mental: string[];
    emotional: string[];
  };
  balance: {
    strengths: string[];
    imbalances: string[];
    recommendations: string[];
  };
}

const DOSHAS: { [key: string]: Dosha } = {
  Vata: {
    name: "Vata",
    elements: ["Air", "Ether"],
    qualities: ["Light", "Dry", "Cold", "Rough", "Mobile", "Subtle"],
    traits: {
      physical: ["Thin build", "Quick movements", "Variable appetite", "Light sleeper"],
      mental: ["Creative", "Quick thinking", "Enthusiastic", "Changeable"],
      emotional: ["Excitable", "Anxious when stressed", "Adaptable", "Imaginative"]
    },
    balance: {
      strengths: ["Creativity", "Flexibility", "Quick learning", "Spiritual insight"],
      imbalances: ["Anxiety", "Insomnia", "Dry skin", "Digestive issues", "Scattered mind"],
      recommendations: ["Warm, nourishing foods", "Regular routine", "Oil massage", "Grounding practices", "Meditation"]
    }
  },
  Pitta: {
    name: "Pitta",
    elements: ["Fire", "Water"],
    qualities: ["Hot", "Sharp", "Light", "Liquid", "Spreading"],
    traits: {
      physical: ["Medium build", "Strong appetite", "Good digestion", "Warm body temperature"],
      mental: ["Intelligent", "Focused", "Organized", "Ambitious"],
      emotional: ["Passionate", "Competitive", "Irritable when stressed", "Driven"]
    },
    balance: {
      strengths: ["Intelligence", "Leadership", "Courage", "Strong digestion"],
      imbalances: ["Anger", "Inflammation", "Acid reflux", "Skin rashes", "Burnout"],
      recommendations: ["Cooling foods", "Avoid excess heat", "Nature time", "Moderation", "Compassion practice"]
    }
  },
  Kapha: {
    name: "Kapha",
    elements: ["Earth", "Water"],
    qualities: ["Heavy", "Slow", "Steady", "Solid", "Cold", "Soft"],
    traits: {
      physical: ["Sturdy build", "Slow digestion", "Good endurance", "Deep sleep"],
      mental: ["Calm", "Steady", "Methodical", "Good memory"],
      emotional: ["Loving", "Patient", "Loyal", "Can be lethargic"]
    },
    balance: {
      strengths: ["Stability", "Endurance", "Patience", "Compassion"],
      imbalances: ["Weight gain", "Lethargy", "Depression", "Congestion", "Attachment"],
      recommendations: ["Light, spicy foods", "Regular exercise", "Variety", "Stimulation", "Dry heat"]
    }
  }
};

interface AyurvedaProfile {
  primaryDosha: Dosha;
  secondaryDosha?: Dosha;
  constitution: "Vata" | "Pitta" | "Kapha" | "Vata-Pitta" | "Pitta-Kapha" | "Vata-Kapha" | "Tridoshic";
  scores: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  recommendations: {
    diet: string[];
    lifestyle: string[];
    yoga: string[];
    seasonalGuidance: string;
  };
  interpretation: {
    summary: string;
    strengths: string[];
    imbalanceWarnings: string[];
    spiritualPath: string;
  };
}

function calculateDoshaFromBirthData(
  birthDate: string,
  sunSign?: string,
  moonSign?: string,
  enneagramType?: number
): { vata: number; pitta: number; kapha: number } {
  let vata = 33;
  let pitta = 33;
  let kapha = 34;
  
  const date = new Date(birthDate);
  const month = date.getMonth();
  
  // Seasonal influence (birth month)
  if ([0, 1, 10, 11].includes(month)) { // Winter
    vata += 10; kapha += 5;
  } else if ([2, 3, 4].includes(month)) { // Spring
    kapha += 10; vata += 5;
  } else if ([5, 6, 7, 8].includes(month)) { // Summer/Fall
    pitta += 10; vata += 5;
  }
  
  // Astrological influence
  const vataSign = ["Gemini", "Libra", "Aquarius"];
  const pittaSigns = ["Aries", "Leo", "Sagittarius"];
  const kaphaSigns = ["Taurus", "Virgo", "Capricorn"];
  const mixedSigns = ["Cancer", "Scorpio", "Pisces"]; // Water - Kapha/Pitta
  
  if (sunSign) {
    if (vataSign.includes(sunSign)) vata += 15;
    else if (pittaSigns.includes(sunSign)) pitta += 15;
    else if (kaphaSigns.includes(sunSign)) kapha += 15;
    else if (mixedSigns.includes(sunSign)) { kapha += 8; pitta += 7; }
  }
  
  if (moonSign) {
    if (vataSign.includes(moonSign)) vata += 10;
    else if (pittaSigns.includes(moonSign)) pitta += 10;
    else if (kaphaSigns.includes(moonSign)) kapha += 10;
    else if (mixedSigns.includes(moonSign)) { kapha += 5; pitta += 5; }
  }
  
  // Enneagram influence
  if (enneagramType) {
    const enneagramDosha: { [key: number]: string } = {
      1: "pitta", 2: "kapha", 3: "pitta", 4: "vata", 5: "vata",
      6: "kapha", 7: "vata", 8: "pitta", 9: "kapha"
    };
    const dominantDosha = enneagramDosha[enneagramType];
    if (dominantDosha === "vata") vata += 10;
    else if (dominantDosha === "pitta") pitta += 10;
    else if (dominantDosha === "kapha") kapha += 10;
  }
  
  // Normalize to 100
  const total = vata + pitta + kapha;
  return {
    vata: Math.round((vata / total) * 100),
    pitta: Math.round((pitta / total) * 100),
    kapha: Math.round((kapha / total) * 100)
  };
}

export function calculateAyurveda(
  birthDate: string,
  astrologyData?: any,
  personalityData?: any
): AyurvedaProfile {
  const scores = calculateDoshaFromBirthData(
    birthDate,
    astrologyData?.sunSign,
    astrologyData?.moonSign,
    personalityData?.enneagram?.type
  );
  
  // Determine constitution
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0] as "vata" | "pitta" | "kapha";
  const secondary = sorted[1][1] > 30 ? sorted[1][0] as "vata" | "pitta" | "kapha" : undefined;
  
  let constitution: AyurvedaProfile["constitution"];
  if (scores.vata > 40 && scores.pitta < 30 && scores.kapha < 30) constitution = "Vata";
  else if (scores.pitta > 40 && scores.vata < 30 && scores.kapha < 30) constitution = "Pitta";
  else if (scores.kapha > 40 && scores.vata < 30 && scores.pitta < 30) constitution = "Kapha";
  else if (scores.vata > 35 && scores.pitta > 35) constitution = "Vata-Pitta";
  else if (scores.pitta > 35 && scores.kapha > 35) constitution = "Pitta-Kapha";
  else if (scores.vata > 35 && scores.kapha > 35) constitution = "Vata-Kapha";
  else constitution = "Tridoshic";
  
  const primaryDosha = DOSHAS[primary.charAt(0).toUpperCase() + primary.slice(1)];
  const secondaryDosha = secondary ? DOSHAS[secondary.charAt(0).toUpperCase() + secondary.slice(1)] : undefined;
  
  return {
    primaryDosha,
    secondaryDosha,
    constitution,
    scores,
    recommendations: {
      diet: primaryDosha.balance.recommendations.filter(r => r.includes("food")),
      lifestyle: primaryDosha.balance.recommendations.filter(r => !r.includes("food")),
      yoga: primary === "vata" ? ["Gentle flow", "Restorative", "Grounding poses"] :
            primary === "pitta" ? ["Cooling practices", "Moon salutations", "Forward bends"] :
            ["Dynamic flow", "Backbends", "Vigorous practice"],
      seasonalGuidance: `As a ${constitution} type, pay extra attention during ${primary === "vata" ? "fall and early winter (Vata season)" : primary === "pitta" ? "summer (Pitta season)" : "late winter and spring (Kapha season)"} when your dosha naturally increases.`
    },
    interpretation: {
      summary: `Your Ayurvedic constitution is ${constitution}, with ${scores[primary]}% ${primary.charAt(0).toUpperCase() + primary.slice(1)}${secondary ? `, ${scores[secondary]}% ${secondary.charAt(0).toUpperCase() + secondary.slice(1)}` : ''}. The ${primaryDosha.elements.join(' and ')} elements govern your body-mind system.`,
      strengths: primaryDosha.balance.strengths,
      imbalanceWarnings: primaryDosha.balance.imbalances,
      spiritualPath: `Your ${primary} nature guides you toward ${primary === "vata" ? "spiritual creativity and subtle awareness" : primary === "pitta" ? "disciplined practice and transformative fire" : "devotional practices and steady grounding"}.`
    }
  };
}
