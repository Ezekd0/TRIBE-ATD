import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Fingerprint, AlertCircle } from 'lucide-react';

interface LoginProps {
  isAdminLogin?: boolean;
}

const Login: React.FC<LoginProps> = ({ isAdminLogin = false }) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { token, user } = await api.post('/auth/login', { email, password });
      
      if (isAdminLogin) {
        if (user.role === 'member') {
          setError('Unauthorized: You do not have administrator privileges.');
          setLoading(false);
          return;
        }
        signIn(token, user);
        navigate('/admin');
      } else {
        signIn(token, user);
        if (user.role === 'admin' || user.role === 'super_admin') {
          navigate('/admin');
        } else {
          navigate('/member');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <Fingerprint className="w-6 h-6 text-black" />
          </div>
        </div>
        <h2 className="text-3xl font-black tracking-tighter mb-2">
          {isAdminLogin ? 'Admin Portal' : 'Member Portal'}
        </h2>
        <p className="text-secondary">
          {isAdminLogin ? 'Authenticate to access the Cave Tribe administration panel' : 'Sign in to access your digital ID'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#111] p-8 rounded-3xl border border-white/5 shadow-2xl">
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start text-sm">
            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold mb-2 text-white/80">Email Address</label>
          <input
            type="email"
            required
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-white/20"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-white/80">Password</label>
          <input
            type="password"
            required
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-white/20"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 bg-black border-white/10 rounded text-white focus:ring-0 focus:ring-offset-0"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-secondary">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a href="#" className="font-bold text-white hover:text-gray-300 transition-colors">
              Recover access?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-bold py-4 px-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-lg shadow-white/5"
        >
          {loading ? 'Authenticating...' : 'Authenticate'}
        </button>
      </form>

      {!isAdminLogin && (
        <div className="mt-8 text-center text-sm text-secondary">
          Not part of the Tribe?{' '}
          <Link to="/register" className="font-bold text-white hover:text-gray-300 transition-colors">
            Request access
          </Link>
        </div>
      )}
    </div>
  );
};

export default Login;
