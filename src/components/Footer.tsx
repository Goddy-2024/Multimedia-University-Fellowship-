import { getVersionInfo } from '../utils/version';

export default function Footer() {
  const { displayText } = getVersionInfo();
  
  return (
    <footer className="mt-8 py-4 border-t border-gray-200">
      <p className="text-center text-gray-500 text-sm">
        {displayText} &copy; Allure Graphics distributions
      </p>
    </footer>
  );
}