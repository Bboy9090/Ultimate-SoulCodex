import { z } from "zod";
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

import traitMatrixJson from "../matrix/trait-mapping-matrix.json";
import contradictionRulesJson from "../rules/contradiction-rules.json";
import bannedLanguageJson from "../rules/banned-language.json";
import weightingRulesJson from "../rules/weighting-rules.json";

import coreIdentityJson from "../content/statement-library/core-identity.json";
import howYouWorkJson from "../content/statement-library/how-you-work.json";
import decisionCodeJson from "../content/statement-library/decision-code.json";
import relationalPatternJson from "../content/statement-library/relational-pattern.json";
import failureConditionsJson from "../content/statement-library/failure-conditions.json";
import optimalConditionsJson from "../content/statement-library/optimal-conditions.json";
import distortionModeJson from "../content/statement-library/distortion-mode.json";
import powerModeJson from "../content/statement-library/power-mode.json";
import missionArcJson from "../content/statement-library/mission-arc.json";
import dailyGuidanceJson from "../content/statement-library/daily-guidance.json";

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

