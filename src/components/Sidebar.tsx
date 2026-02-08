import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut, 
  Settings, 
  BarChart2, 
  Globe, 
  Mail,
  Shield,
  Lock,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="bg-gray-900 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="flex items-center pl-2 pr-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-2.5 rounded-lg shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white">BankingSuite</h1>
            <span className="text-xs text-gray-400 font-medium">v1.0</span>
          </div>
        </div>
      </div>
      <nav className="space-y-2">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase">Marketing</p>
        </div>
        
        <NavLink
          to="/admin/leads"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Users size={20} />
          <span>Protokolle</span>
        </NavLink>
        
        <NavLink
          to="/admin/import"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Upload size={20} />
          <span>Import</span>
        </NavLink>
        
        <NavLink
          to="/admin/bank-templates"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <FileText size={20} />
          <span>Bank Vorlagen</span>
        </NavLink>

        <NavLink
          to="/admin/landing-pages"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Globe size={20} />
          <span>Landing Pages</span>
        </NavLink>

        <NavLink
          to="/admin/campaigns"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <BarChart2 size={20} />
          <span>Kampagnen</span>
        </NavLink>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase">Webseite</p>
        </div>

        <NavLink
          to="/admin/domains"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Globe size={20} />
          <span>Domains</span>
        </NavLink>

        <NavLink
          to="/admin/email-templates"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Mail size={20} />
          <span>E-Mail Vorlagen</span>
        </NavLink>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase">Einstellungen</p>
        </div>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Settings size={20} />
          <span>Einstellungen</span>
        </NavLink>
        
        <NavLink
          to="/admin/session-control"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Shield size={20} />
          <span>Sitzungskontrolle</span>
        </NavLink>
        
        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <BarChart2 size={20} />
          <span>Analysen</span>
        </NavLink>
        
        <NavLink
          to="/admin/security"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Lock size={20} />
          <span>Sicherheit</span>
        </NavLink>
      </nav>
      <div className="absolute bottom-0 w-full left-0 p-4">
        <button
          onClick={logout}
          className="flex items-center space-x-2 text-gray-400 hover:text-white w-full py-2.5 px-4 rounded transition duration-200 hover:bg-red-600"
        >
          <LogOut size={20} />
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );
};