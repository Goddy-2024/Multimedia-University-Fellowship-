import versionInfo from "../version.json";

const Footer = () => {
  return (
    <footer className="text-sm text-gray-400 text-center p-4">
      <p>
        fellowship-admin v{versionInfo.version} • Commit{" "}
        <code>{versionInfo.commitHash}</code> • {versionInfo.buildDate}
      </p>
    </footer>
  );
};
export default Footer;
