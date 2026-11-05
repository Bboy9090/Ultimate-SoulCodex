import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function resolveBuild(env) {
  const prefix = "qualification/ios-billing-";
  const qualificationBranch = env.GITHUB_EVENT_NAME === "push" && env.GITHUB_REF_NAME?.startsWith(prefix);
  const branchBuild = qualificationBranch ? env.GITHUB_REF_NAME.slice(prefix.length) : "";
  const requested = env.QUALIFICATION_REQUEST || "false";
  if (!["true", "false"].includes(requested)) throw new Error("Invalid qualification request");
  const qualification = Boolean(qualificationBranch) || requested === "true";
  const number = branchBuild || env.QUALIFICATION_BUILD_NUMBER || "";
  if (qualification && (!/^[1-9][0-9]{6,8}$/.test(number) || Number(number) <= 4000014)) {
    throw new Error("Qualification requires a reserved unique build number greater than 4000014");
  }
  if (!qualification && number) throw new Error("Build number requires explicit qualification mode");
  if (requested === "true" && env.GITHUB_EVENT_NAME !== "workflow_dispatch") {
    throw new Error("Explicit qualification request requires workflow_dispatch");
  }
  return {
    IOS_BUILD_NUMBER: qualification ? number : "4000014",
    VITE_BILLING_QUALIFICATION_MODE: String(qualification),
    SOUL_CODEX_IOS_QUALIFICATION_BUILD: String(qualification),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = resolveBuild(process.env);
  if (!process.env.GITHUB_ENV) throw new Error("GITHUB_ENV required");
  appendFileSync(process.env.GITHUB_ENV, Object.entries(result).map(([key, value]) => `${key}=${value}\n`).join(""));
  console.log(`iOS build ${result.IOS_BUILD_NUMBER}; qualification=${result.VITE_BILLING_QUALIFICATION_MODE}; artifact only, provider transactions not tested`);
}
