import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Fingerprint, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabase';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Male',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone_number: formData.phone,
            gender: formData.gender,
            address: formData.address,
            emergency_contact_name: formData.emergencyName,
            emergency_contact_phone: formData.emergencyPhone,
          }
        }
      });
      if (authError) throw authError;
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Full registration error:', err);
      let errorMsg = 'Registration failed. Please try again.';
      
      if (err && typeof err === 'object') {
        errorMsg = err.message || JSON.stringify(err);
      } else if (typeof err === 'string') {
        errorMsg = err;
      }

      // If the error message is empty or serialized as empty object, show a generic friendly error
      if (errorMsg === '{}' || !errorMsg) {
        errorMsg = 'Registration failed. Please double-check your email format, password length, and try again.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black tracking-tight">Application Received</h2>
        <p className="text-secondary leading-relaxed">
          Your registration for the Cave Tribe Access System has been submitted successfully. Your account is currently <strong className="text-white">PENDING</strong>.
        </p>
        <p className="text-secondary leading-relaxed mb-8">
          An administrator must verify your identity before you are granted access. You will be notified once approved.
        </p>
        <Link to="/" className="inline-block bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
            <Fingerprint className="w-6 h-6 text-black" />
          </div>
        </div>
        <h2 className="text-3xl font-black tracking-tighter mb-2">Request Access</h2>
        <p className="text-secondary">Join the Cave Tribe exclusive network</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-[#111] p-8 rounded-3xl border border-white/5 shadow-2xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-white/80">Full Name *</label>
            <input
              type="text"
              name="fullName"
              required
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-white/20"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-white/80">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-white/20"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-white/80">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-white/20"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-white/80">Gender *</label>
            <select
              name="gender"
              required
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-white/80">Residential Address *</label>
            <input
              type="text"
              name="address"
              required
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-white/20"
              placeholder="123 Tribe Avenue, City"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-white/80">Postal Code *</label>
            <input
              type="text"
              name="postalCode"
              required
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-white/20"
              placeholder="100001"
              value={(formData as any).postalCode || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Emergency Contact</h3>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold mb-2 text-white/80">Contact Name *</label>
              <input
                type="text"
                name="emergencyName"
                required
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-white/20"
                placeholder="Jane Doe"
                value={formData.emergencyName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-white/80">Contact Phone *</label>
              <input
                type="tel"
                name="emergencyPhone"
                required
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-white/20"
                placeholder="+1 987 654 321"
                value={formData.emergencyPhone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <label className="block text-sm font-bold mb-2 text-white/80">Create Password *</label>
          <input
            type="password"
            name="password"
            required
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-white/20"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-bold py-4 px-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 mt-6 shadow-lg shadow-white/5"
        >
          {loading ? 'Submitting Application...' : 'Submit Registration'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-secondary">
        Already have an approved account?{' '}
        <Link to="/login" className="font-bold text-white hover:text-gray-300 transition-colors">
          Sign in here
        </Link>
      </div>
    </div>
  );
};

export default Register;
