// Sacred Geometry - Platonic Solids, Flower of Life, Golden Ratio

interface PlatonicSolid {
  name: string;
  element: string;
  faces: number;
  vertices: number;
  edges: number;
  meaning: string;
  spiritualQuality: string;
  chakraConnection: string;
}

const PLATONIC_SOLIDS: PlatonicSolid[] = [
  { name: "Tetrahedron", element: "Fire", faces: 4, vertices: 4, edges: 6, meaning: "Manifestation and will", spiritualQuality: "Divine spark", chakraConnection: "Solar Plexus" },
  { name: "Hexahedron (Cube)", element: "Earth", faces: 6, vertices: 8, edges: 12, meaning: "Grounding and stability", spiritualQuality: "Foundation", chakraConnection: "Root" },
  { name: "Octahedron", element: "Air", faces: 8, vertices: 6, edges: 12, meaning: "Integration and balance", spiritualQuality: "Breath of life", chakraConnection: "Heart" },
  { name: "Dodecahedron", element: "Ether/Universe", faces: 12, vertices: 20, edges: 30, meaning: "Ascension and cosmic consciousness", spiritualQuality: "Divine blueprint", chakraConnection: "Crown" },
  { name: "Icosahedron", element: "Water", faces: 20, vertices: 12, edges: 30, meaning: "Flow and transformation", spiritualQuality: "Emotional wisdom", chakraConnection: "Sacral" }
];

interface SacredGeometryProfile {
  birthSolid: PlatonicSolid;
  lifePathSolid: PlatonicSolid;
  goldenRatio: {
    personalPhi: number;
    fibonacci: number[];
    spiralGuidance: string;
  };
  flowerOfLife: {
    seedPattern: string;
    expansionCycles: number;
    manifestation: string;
  };
  metatronsCube: {
    activeVertices: number[];
    energyFlow: string;
  };
  interpretation: {
    summary: string;
    geometricEssence: string;
    creationPattern: string;
    spiritualArchitecture: string;
  };
}

function calculateFibonacci(n: number): number[] {
  const fib = [1, 1];
  for (let i = 2; i < n; i++) {
    fib[i] = fib[i-1] + fib[i-2];
  }
  return fib;
}

function calculateGoldenRatio(lifePath: number): number {
  const phi = 1.618033988749;
  return parseFloat((lifePath * phi).toFixed(3));
}

export function calculateSacredGeometry(
  birthDate: string,
  lifePath: number,
  name: string
): SacredGeometryProfile {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  
  // Birth solid from day
  const birthSolidIndex = (day - 1) % 5;
  const birthSolid = PLATONIC_SOLIDS[birthSolidIndex];
  
  // Life path solid
  const lifePathSolidIndex = (lifePath - 1) % 5;
  const lifePathSolid = PLATONIC_SOLIDS[lifePathSolidIndex];
  
  // Golden ratio calculations
  const personalPhi = calculateGoldenRatio(lifePath);
  const fibonacci = calculateFibonacci(10);
  
  // Flower of Life - seed pattern from birth month
  const seedPatterns = [
    "Single seed - Unity",
    "Vesica Piscis - Duality",
    "Trinity - Three circles",
    "Four-fold - Stability",
    "Five-fold - Life force",
    "Six-fold - Creation complete",
    "Seven-fold - Mystical",
    "Eight-fold - Infinity",
    "Nine-fold - Completion",
    "Ten-fold - Manifestation",
    "Eleven-fold - Master gateway",
    "Twelve-fold - Cosmic order"
  ];
  const seedPattern = seedPatterns[(month - 1) % 12];
  
  // Metatron's Cube vertices (simplified)
  const nameValue = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const activeVertices = [
    (nameValue % 13) + 1,
    ((nameValue * 2) % 13) + 1,
    ((nameValue * 3) % 13) + 1
  ];
  
  return {
    birthSolid,
    lifePathSolid,
    goldenRatio: {
      personalPhi,
      fibonacci,
      spiralGuidance: `Your personal golden ratio of ${personalPhi} reveals your unique spiral of growth. You expand in Fibonacci sequence: ${fibonacci.slice(0, 7).join(', ')}...`
    },
    flowerOfLife: {
      seedPattern,
      expansionCycles: month,
      manifestation: `Your Flower of Life blooms in ${seedPattern} configuration, completing ${month} expansion cycles before manifesting in physical reality.`
    },
    metatronsCube: {
      activeVertices,
      energyFlow: `Vertices ${activeVertices.join(', ')} are illuminated in your Metatron's Cube, creating a unique energy flow pattern through the sacred geometric matrix.`
    },
    interpretation: {
      summary: `Born under the ${birthSolid.name} (${birthSolid.element} element), your geometric essence expresses through ${birthSolid.faces} faces of manifestation. Your life path resonates with the ${lifePathSolid.name}.`,
      geometricEssence: `The ${birthSolid.name} connects you to ${birthSolid.chakraConnection} chakra, teaching ${birthSolid.meaning}. Its ${birthSolid.faces} faces, ${birthSolid.vertices} vertices, and ${birthSolid.edges} edges create your sacred template.`,
      creationPattern: `You create through ${lifePathSolid.spiritualQuality}, following the ${lifePathSolid.name}'s blueprint. The golden ratio of ${personalPhi} guides your expansion.`,
      spiritualArchitecture: `Your soul's geometry combines ${birthSolid.element} (birth) with ${lifePathSolid.element} (destiny), creating a unique vibrational structure that interfaces with universal patterns.`
    }
  };
}
