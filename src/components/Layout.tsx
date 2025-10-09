import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Calendar,
  FileText,
  Mail,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Email', href: '/email', icon: Mail },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed z-30 inset-y-0 left-0 transform bg-white shadow-lg transition-transform duration-300 ease-in-out w-64
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static`}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">MMU RHSF Admin</h1>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-700 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6">
          <div className="px-3 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Navigation
            </p>
          </div>

          <div className="space-y-1 px-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)} // Close sidebar when navigating (mobile)
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="flex items-center justify-between bg-white shadow-md px-6 py-4 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-700 hover:text-gray-900"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h2 className="text-lg font-semibold text-gray-800">MMU RHSF</h2>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
        />
      )}
    </div>
  );
};

export default Layout;
