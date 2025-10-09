// scripts/version.js
import { execSync } from "child_process";
import { writeFileSync, readFileSync } from "fs";

try {
  // Get commit info (Node environment)
  const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
  const commitDate = execSync("git log -1 --format=%cd --date=short").toString().trim();

  // Read version from package.json
  const packageJson = JSON.parse(readFileSync("./package.json", "utf8"));
  const version = packageJson.version;

  // Create version info object
  const versionInfo = {
    version,
    commitHash,
    commitDate,
    buildDate: new Date().toISOString().split("T")[0],
  };

  // Write to src/version.json
  writeFileSync("./src/version.json", JSON.stringify(versionInfo, null, 2));
  console.log(" Version info generated:", versionInfo);
} catch (err) {
  console.error("Failed to generate version info:", err);
  process.exit(1);
}
