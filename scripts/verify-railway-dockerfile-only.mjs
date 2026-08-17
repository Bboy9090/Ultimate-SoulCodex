import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const requiredDockerfile = resolve(root, "Dockerfile");
const railwayConfigPath = resolve(root, "railway.json");

const forbiddenCompetingConfigs = [
  "Procfile",
  "nixpacks.toml",
  "nixpacks.json",
  "railpack.toml",
  "railpack.json",
  "railway.toml",
  ".railway/Procfile",
  ".railway/nixpacks.toml",
  ".railway/railpack.toml",
];

function fail(message) {
  console.error(`RAILWAY_DOCKERFILE_ONLY_FAIL: ${message}`);
  process.exitCode = 1;
}

if (!existsSync(requiredDockerfile)) {
  fail("root Dockerfile is missing");
}

if (!existsSync(railwayConfigPath)) {
  fail("railway.json is missing");
} else {
  try {
    const config = JSON.parse(readFileSync(railwayConfigPath, "utf8"));
    if (config?.build?.builder !== "DOCKERFILE") {
      fail(`railway.json build.builder must be DOCKERFILE, got ${JSON.stringify(config?.build?.builder)}`);
    }
    if (config?.build?.dockerfilePath !== "Dockerfile") {
      fail(`railway.json build.dockerfilePath must be Dockerfile, got ${JSON.stringify(config?.build?.dockerfilePath)}`);
    }
  } catch (error) {
    fail(`railway.json could not be parsed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

for (const path of forbiddenCompetingConfigs) {
  if (existsSync(resolve(root, path))) {
    fail(`competing Railway build/start configuration is forbidden: ${path}`);
  }
}

if (!process.exitCode) {
  console.log("RAILWAY_DOCKERFILE_ONLY_PASS");
  console.log("builder=DOCKERFILE");
  console.log("dockerfilePath=Dockerfile");
  console.log("competing repo-level builder/start configs=none");
}
