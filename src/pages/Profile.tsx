import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { Loader2, Camera } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone_number || ''
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate size (max 2MB to be safe and fast)
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo must be smaller than 2MB.');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      // Using a timestamped path to prevent aggressive caching
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      alert('Profile photo updated successfully!');
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Failed to upload photo. Make sure the storage bucket exists.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          phone_number: formData.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-medium mb-4">Personal Information</h2>
        
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-border overflow-hidden flex items-center justify-center text-2xl font-bold relative group">
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.full_name.charAt(0)
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
          </div>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <button 
              onClick={handlePhotoClick}
              disabled={uploading}
              className="flex items-center bg-background border border-border px-4 py-2 rounded text-sm hover:bg-border transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4 mr-2" /> Change Photo
            </button>
            <p className="text-xs text-secondary mt-2">JPG, GIF or PNG. Max size of 2MB</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
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
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center bg-primary text-background px-6 py-2 rounded-md hover:bg-opacity-90 font-medium disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
