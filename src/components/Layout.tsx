import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, Calendar, FileText, Mail, LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();

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
      <div className="w-64 bg-white shadow-lg fixed">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">MMU RHSF Admin</h1>
        </div>
        
        <nav className="mt-6">
          <div className="px-3 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation</p>
          </div>
          
          <div className="space-y-1 px-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
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
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;