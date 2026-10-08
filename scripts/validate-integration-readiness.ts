import { resolveIntegrationReadiness } from "../server/lib/integration-readiness";

const report = resolveIntegrationReadiness(process.env);
const summary = Object.fromEntries(
  Object.entries(report.providers).map(([provider, state]) => [
    provider,
    {
      status: state.status,
      mode: state.mode,
      missingRequirements: state.missingRequirements,
      policyBlockers: state.policyBlockers,
    },
  ]),
);

console.log(JSON.stringify({
  environment: report.environment,
  configurationGatePassed: report.configurationGatePassed,
  claimsProductionActivationReady: report.claimsProductionActivationReady,
  providers: summary,
  blockers: report.blockers,
  activationEvidenceRequired: report.activationEvidenceRequired,
}, null, 2));

if (!report.configurationGatePassed) {
  process.exitCode = 1;
}
