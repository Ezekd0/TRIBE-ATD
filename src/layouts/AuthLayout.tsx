import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/member'} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 border-r border-border">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Outlet />
        </div>
      </div>
      
      {/* Right side - Image/Branding */}
      <div className="hidden lg:block relative w-0 flex-1 bg-card">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-6xl font-bold tracking-tighter text-primary mb-4">TRIBE ATD</h1>
            <p className="text-xl text-secondary max-w-md mx-auto">
              Cave Attendance & Digital Identity System. Secure, fast, and minimal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
