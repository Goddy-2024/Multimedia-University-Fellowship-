import packageJson from "../../package.json";

export const getVersionInfo = () => {
  const version = packageJson.version;
  const buildDate = new Date().toISOString().split("T")[0];

  return {
    version,
    buildDate,
    displayText: `fellowship-admin v${version} (${buildDate})`
  };
};
