import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { NotificationBell } from './notifications/NotificationBell';
import GlobalSearch from './GlobalSearch';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm">
      <div className="w-full px-4">
        <div className="flex justify-between items-center h-16">
          {/* Global Search */}
          <GlobalSearch />

          {/* Right side actions */}
          <div className="flex items-center space-x-2 ml-4">
            <NotificationBell />
            <button 
              onClick={() => navigate('/admin/settings')}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-colors duration-200"
              title="Einstellungen"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};