// scripts/version.js
import { execSync } from "child_process";
import { writeFileSync, readFileSync } from "fs";

try {
  // 1️⃣ Read package.json
  const packageJson = JSON.parse(readFileSync("./package.json", "utf8"));
  let [major, minor, patch] = packageJson.version.split(".").map(Number);

  // 2️⃣ Auto-increment patch version
  patch += 1;
  const newVersion = `${major}.${minor}.${patch}`;
  packageJson.version = newVersion;

  // 3️⃣ Write updated package.json
  writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));

  // 4️⃣ Get Git commit info
  const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
  const commitDate = execSync("git log -1 --format=%cd --date=short").toString().trim();
  const branchName = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();

  // 5️⃣ Generate version.json (used in React app)
  const versionInfo = {
    version: newVersion,
    commitHash,
    commitDate,
    branch: branchName,
    buildDate: new Date().toISOString().split("T")[0],
  };

  writeFileSync("./src/version.json", JSON.stringify(versionInfo, null, 2));

  console.log("Version updated to:", newVersion);
  console.log("Commit:", commitHash, "| Branch:", branchName);
} catch (err) {
  console.error("Version generation failed:", err);
  process.exit(1);
}
