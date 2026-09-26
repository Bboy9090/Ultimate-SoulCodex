export type VerifiedPlacementEvidenceForSynthesis = {
  source?: string | null;
  engine?: string | null;
  calculatedAt?: string | null;
};

export type VerifiedPlacementForSynthesis = {
  verificationStatus?: string;
  sign?: string | null;
  evidence?: VerifiedPlacementEvidenceForSynthesis | null;
  provenance?: VerifiedPlacementEvidenceForSynthesis | null;
  policyId?: string;
  evidenceArtifactId?: string;
};

export type VerifiedAstrologyForSynthesis = {
  sun?: VerifiedPlacementForSynthesis;
  moon?: VerifiedPlacementForSynthesis;
  rising?: VerifiedPlacementForSynthesis;
  planets?: Partial<Record<
    "sun" | "moon" | "mercury" | "venus" | "mars" |
    "jupiter" | "saturn" | "uranus" | "neptune" | "pluto",
    VerifiedPlacementForSynthesis
  >>;
  planetaryHouses?: Partial<Record<
    "sun" | "moon" | "mercury" | "venus" | "mars" |
    "jupiter" | "saturn" | "uranus" | "neptune" | "pluto",
    number
  >>;
  midheaven?: VerifiedPlacementForSynthesis;
  northNode?: VerifiedPlacementForSynthesis & { house?: number; mode?: string };
  southNode?: VerifiedPlacementForSynthesis & { house?: number; mode?: string };
  chiron?: VerifiedPlacementForSynthesis & {
    house?: number;
    qualificationMethod?: string;
  };
  aspects?: Array<{
    planet1?: string;
    planet2?: string;
    aspect?: string;
    orb?: number;
    policyId?: string;
    evidenceArtifactId?: string;
  }>;
  verification?: {
    policyId?: string;
  };
};
