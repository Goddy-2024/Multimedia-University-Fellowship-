// Version utility for git-based versioning
export const getVersionInfo = () => {
  // In a real implementation, this would read from git or package.json
  // For now, we'll use a static version that can be updated
  const version = "2.1.0";
  const buildDate = new Date().toISOString().split('T')[0];
  
  return {
    version,
    buildDate,
    displayText: `fellowship-admin v${version} (${buildDate})`
  };
};
