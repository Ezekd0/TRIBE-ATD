import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Role } from '../types';
// import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (role: Role) => void; // Mock sign in for dev
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Users for UI Development
const mockMember: User = {
  id: 'user-1',
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  gender: 'Male',
  role: 'member',
  status: 'ACTIVE',
  created_at: new Date().toISOString(),
};

const mockAdmin: User = {
  id: 'admin-1',
  full_name: 'Admin User',
  email: 'admin@tribe.com',
  phone: '+0987654321',
  gender: 'Female',
  role: 'admin',
  status: 'ACTIVE',
  created_at: new Date().toISOString(),
};

const mockSuperAdmin: User = {
  id: 'super-admin-1',
  full_name: 'Super Admin',
  email: 'super@tribe.com',
  phone: '+1112223333',
  gender: 'Other',
  role: 'super_admin',
  status: 'ACTIVE',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the Supabase session here
    // For now, we simulate a loading state
    const checkUser = async () => {
      setLoading(true);
      // Simulate network delay
      setTimeout(() => {
        // Automatically sign in as admin for demo purposes (or leave null to test login)
        // setUser(mockAdmin);
        setUser(null);
        setLoading(false);
      }, 500);
    };

    checkUser();
  }, []);

  const signIn = (role: Role) => {
    if (role === 'super_admin') {
      setUser(mockSuperAdmin);
    } else if (role === 'admin') {
      setUser(mockAdmin);
    } else {
      setUser(mockMember);
    }
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
