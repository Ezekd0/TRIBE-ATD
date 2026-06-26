import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  CreditCard, 
  History, 
  ScanLine, 
  Users, 
  FileText,
  LogOut,
  X
} from 'lucide-react';
import type { User } from '../types';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  user: User;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onClose }) => {
  const { signOut } = useAuth();
  const isAdmin = user.role === 'admin';

  const memberLinks = [
    { name: 'Dashboard', to: '/member', icon: LayoutDashboard, exact: true },
    { name: 'Digital ID', to: '/member/id', icon: CreditCard },
    { name: 'Attendance', to: '/member/history', icon: History },
    { name: 'Profile', to: '/member/profile', icon: UserCircle },
  ];

  const adminLinks = [
    { name: 'Overview', to: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'QR Scanner', to: '/admin/scan', icon: ScanLine },
    { name: 'Members', to: '/admin/members', icon: Users },
    { name: 'Records', to: '/admin/records', icon: FileText },
  ];

  const links = isAdmin ? adminLinks : memberLinks;

  return (
    <div className="h-screen w-64 bg-black/40 backdrop-blur-3xl border-r border-white/10 text-white flex flex-col fixed top-0 left-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tighter">TRIBE <span className="font-light text-[#B3B3B3]">ATD</span></h1>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-secondary hover:text-primary">
            <X size={24} />
          </button>
        )}
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto px-4">
        <nav className="flex-1 space-y-2">
          {links.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'text-secondary hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon
                className="mr-3 flex-shrink-0 h-5 w-5"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => {
            signOut();
            if (onClose) onClose();
          }}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-secondary hover:text-red-400 transition-colors group"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
