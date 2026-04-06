// Arabic Parts (Lots) - Calculated points of synthesis

interface ArabicPart {
  name: string;
  longitude: number;
  sign: string;
  house: number;
  degree: number;
  meaning: string;
  interpretation: string;
}

interface ArabicPartsData {
  partOfFortune: ArabicPart;
  partOfSpirit: ArabicPart;
  partOfLove: ArabicPart;
  partOfMarriage: ArabicPart;
  partOfFather: ArabicPart;
  partOfMother: ArabicPart;
  interpretation: {
    material: string; // Fortune
    spiritual: string; // Spirit
    romantic: string; // Love
    union: string; // Marriage
    legacy: string; // Father/Mother
    synthesis: string;
  };
}

function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

function getSignFromLongitude(longitude: number): string {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return signs[Math.floor(longitude / 30) % 12];
}

function calculateHouse(longitude: number, ascendantLongitude: number): number {
  let houseLongitude = longitude - ascendantLongitude;
  if (houseLongitude < 0) houseLongitude += 360;
  return (Math.floor(houseLongitude / 30) % 12) + 1;
}

export function calculateArabicParts(
  ascendantLongitude: number,
  sunLongitude: number,
  moonLongitude: number,
  venusLongitude: number,
  jupiterLongitude: number,
  saturnLongitude: number,
  isDayBirth: boolean // Sun above horizon
): ArabicPartsData {
  // Part of Fortune (Day: Asc + Moon - Sun; Night: Asc + Sun - Moon)
  const fortuneLongitude = isDayBirth
    ? normalizeAngle(ascendantLongitude + moonLongitude - sunLongitude)
    : normalizeAngle(ascendantLongitude + sunLongitude - moonLongitude);
  
  // Part of Spirit (Day: Asc + Sun - Moon; Night: Asc + Moon - Sun)
  const spiritLongitude = isDayBirth
    ? normalizeAngle(ascendantLongitude + sunLongitude - moonLongitude)
    : normalizeAngle(ascendantLongitude + moonLongitude - sunLongitude);
  
  // Part of Love (Asc + Venus - Spirit)
  const loveLongitude = normalizeAngle(ascendantLongitude + venusLongitude - spiritLongitude);
  
  // Part of Marriage (Asc + 7th house cusp - Venus)
  const seventhHouse = normalizeAngle(ascendantLongitude + 180);
  const marriageLongitude = normalizeAngle(ascendantLongitude + seventhHouse - venusLongitude);
  
  // Part of Father (Asc + Sun - Saturn)
  const fatherLongitude = normalizeAngle(ascendantLongitude + sunLongitude - saturnLongitude);
  
  // Part of Mother (Asc + Moon - Venus)
  const motherLongitude = normalizeAngle(ascendantLongitude + moonLongitude - venusLongitude);
  
  const createPart = (name: string, longitude: number, meaning: string): ArabicPart => ({
    name,
    longitude,
    sign: getSignFromLongitude(longitude),
    house: calculateHouse(longitude, ascendantLongitude),
    degree: longitude % 30,
    meaning,
    interpretation: `Your ${name} at ${(longitude % 30).toFixed(1)}° ${getSignFromLongitude(longitude)} (House ${calculateHouse(longitude, ascendantLongitude)}) reveals ${meaning.toLowerCase()} through ${getSignFromLongitude(longitude)} energy.`
  });
  
  const partOfFortune = createPart(
    "Part of Fortune",
    fortuneLongitude,
    "Material well-being, worldly success, and where life flows easily"
  );
  
  const partOfSpirit = createPart(
    "Part of Spirit",
    spiritLongitude,
    "Spiritual purpose, inner fulfillment, and soul's calling"
  );
  
  const partOfLove = createPart(
    "Part of Love",
    loveLongitude,
    "Romantic attraction, love nature, and heart's desire"
  );
  
  const partOfMarriage = createPart(
    "Part of Marriage",
    marriageLongitude,
    "Partnership potential, marriage themes, and union"
  );
  
  const partOfFather = createPart(
    "Part of Father",
    fatherLongitude,
    "Paternal influence, authority, and masculine legacy"
  );
  
  const partOfMother = createPart(
    "Part of Mother",
    motherLongitude,
    "Maternal influence, nurturing, and feminine legacy"
  );
  
  return {
    partOfFortune,
    partOfSpirit,
    partOfLove,
    partOfMarriage,
    partOfFather,
    partOfMother,
    interpretation: {
      material: `Your Part of Fortune in ${partOfFortune.sign} House ${partOfFortune.house} shows where worldly success flows naturally. Cultivate ${partOfFortune.sign} qualities to attract abundance.`,
      spiritual: `Part of Spirit in ${partOfSpirit.sign} House ${partOfSpirit.house} reveals your soul's true calling. Your spiritual purpose manifests through ${partOfSpirit.sign} expression.`,
      romantic: `Part of Love in ${partOfLove.sign} House ${partOfLove.house} shows how you experience romantic love. Your heart opens through ${partOfLove.sign} qualities.`,
      union: `Part of Marriage in ${partOfMarriage.sign} House ${partOfMarriage.house} indicates partnership themes. Successful unions embody ${partOfMarriage.sign} principles.`,
      legacy: `Part of Father (${partOfFather.sign}) and Mother (${partOfMother.sign}) reveal your parental legacy and how you integrate masculine/feminine ancestral patterns.`,
      synthesis: `The Arabic Parts synthesize planetary energies into key life areas: Fortune (material), Spirit (purpose), Love (romance), Marriage (partnership), and parental legacies create your life's sacred geometry.`
    }
  };
}
