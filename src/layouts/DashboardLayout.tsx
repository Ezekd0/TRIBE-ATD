import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

interface DashboardLayoutProps {
  requiredRole?: 'admin' | 'member';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ requiredRole }) => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/member" replace />;
  }
  if (requiredRole === 'member' && (user.role === 'admin' || user.role === 'super_admin')) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <Sidebar user={user} />
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <Navbar 
          user={user} 
          onOpenSidebar={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar (simplified for now, ideally use Dialog from headless UI) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64">
            <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
