export type HouseSystem = "placidus" | "equal" | "whole_sign";

export interface AstroRequest {
  dateISO: string;
  time24?: string;
  timeUnknown: boolean;
  place: string;
  timezone?: string;
  lat?: number;
  lon?: number;
  houseSystem?: HouseSystem;
}

export interface AstroResult {
  sun: string;
  moon: string;
  rising?: string;
  planets?: Record<string, { sign: string; degree: number; longitude: number }>;
  houses?: { system: HouseSystem; cusps: number[] };
  aspects?: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>;
  notes?: string[];
}

export interface AstroProvider {
  name: string;
  getChart(req: AstroRequest): Promise<AstroResult>;
}
