import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Profile: React.FC = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone_number || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-medium mb-4">Personal Information</h2>
        
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-border overflow-hidden flex items-center justify-center text-2xl font-bold">
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.full_name.charAt(0)
            )}
          </div>
          <div>
            <button className="bg-background border border-border px-4 py-2 rounded text-sm hover:bg-border transition-colors">
              Change Photo
            </button>
            <p className="text-xs text-secondary mt-2">JPG, GIF or PNG. Max size of 800K</p>
          </div>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="w-full bg-background border border-border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                disabled
                className="w-full bg-background/50 border border-border rounded-md px-4 py-2 text-secondary cursor-not-allowed"
                value={user?.email}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                className="w-full bg-background border border-border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-6 flex justify-end">
            <button type="button" className="bg-primary text-background px-6 py-2 rounded-md hover:bg-opacity-90 font-medium">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
