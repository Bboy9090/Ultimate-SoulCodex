import { z } from "zod";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  bannedLanguageSchema,
  contradictionRulesSchema,
  statementSchema,
  traitMappingMatrixSchema,
  weightingRulesSchema,
  type BannedLanguage,
  type ContradictionRules,
  type Statement,
  type TraitMappingMatrix,
  type WeightingRules,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readJson(relPath: string): any {
  const absPath = join(__dirname, relPath);
  return JSON.parse(readFileSync(absPath, "utf-8"));
}

const traitMatrixJson = readJson("../matrix/trait-mapping-matrix.json");
const contradictionRulesJson = readJson("../rules/contradiction-rules.json");
const bannedLanguageJson = readJson("../rules/banned-language.json");
const weightingRulesJson = readJson("../rules/weighting-rules.json");

const coreIdentityJson = readJson("../content/statement-library/core-identity.json");
const howYouWorkJson = readJson("../content/statement-library/how-you-work.json");
const decisionCodeJson = readJson("../content/statement-library/decision-code.json");
const relationalPatternJson = readJson("../content/statement-library/relational-pattern.json");
const failureConditionsJson = readJson("../content/statement-library/failure-conditions.json");
const optimalConditionsJson = readJson("../content/statement-library/optimal-conditions.json");
const distortionModeJson = readJson("../content/statement-library/distortion-mode.json");
const powerModeJson = readJson("../content/statement-library/power-mode.json");
const missionArcJson = readJson("../content/statement-library/mission-arc.json");
const dailyGuidanceJson = readJson("../content/statement-library/daily-guidance.json");

const statementLibrarySchema = z.object({
  core_identity: z.array(statementSchema).default([]),
  how_you_work: z.array(statementSchema).default([]),
  decision_code: z.array(statementSchema).default([]),
  relational_pattern: z.array(statementSchema).default([]),
  failure_conditions: z.array(statementSchema).default([]),
  optimal_conditions: z.array(statementSchema).default([]),
  distortion_mode: z.array(statementSchema).default([]),
  power_mode: z.array(statementSchema).default([]),
  mission_arc: z.array(statementSchema).default([]),
  daily_guidance: z.array(statementSchema).default([]),
});

export type StatementLibrary = z.infer<typeof statementLibrarySchema>;

export type EngineLibraries = {
  matrix: TraitMappingMatrix;
  contradictionRules: ContradictionRules;
  bannedLanguage: BannedLanguage;
  weightingRules: WeightingRules;
  statements: StatementLibrary;
};

function parseStatements(raw: unknown): Statement[] {
  return z.array(statementSchema).parse(raw);
}

export function loadEngineLibraries(): EngineLibraries {
  const matrix = traitMappingMatrixSchema.parse(traitMatrixJson);
  const contradictionRules = contradictionRulesSchema.parse(contradictionRulesJson);
  const bannedLanguage = bannedLanguageSchema.parse(bannedLanguageJson);
  const weightingRules = weightingRulesSchema.parse(weightingRulesJson);

  const statements = statementLibrarySchema.parse({
    core_identity: parseStatements(coreIdentityJson),
    how_you_work: parseStatements(howYouWorkJson),
    decision_code: parseStatements(decisionCodeJson),
    relational_pattern: parseStatements(relationalPatternJson),
    failure_conditions: parseStatements(failureConditionsJson),
    optimal_conditions: parseStatements(optimalConditionsJson),
    distortion_mode: parseStatements(distortionModeJson),
    power_mode: parseStatements(powerModeJson),
    mission_arc: parseStatements(missionArcJson),
    daily_guidance: parseStatements(dailyGuidanceJson),
  });

  return { matrix, contradictionRules, bannedLanguage, weightingRules, statements };
}

