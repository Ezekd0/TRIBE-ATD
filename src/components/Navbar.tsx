import React from 'react';
import { Menu, Bell } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  user: User;
  onOpenSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onOpenSidebar }) => {
  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-background border-b border-border">
      <button
        type="button"
        className="px-4 border-r border-border text-secondary hover:text-primary focus:outline-none md:hidden"
        onClick={onOpenSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          {/* Search or breadcrumbs could go here */}
        </div>
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          <button className="bg-background p-1 rounded-full text-secondary hover:text-primary focus:outline-none">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Profile dropdown */}
          <div className="relative flex items-center space-x-3">
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-sm font-medium text-primary block">{user.full_name}</span>
              <span className="text-xs text-secondary capitalize">{user.role}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-border flex items-center justify-center text-primary font-bold overflow-hidden">
              {user.photo_url ? (
                <img src={user.photo_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                user.full_name.charAt(0)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
