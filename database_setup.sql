-- Execute this script in your Supabase SQL Editor to set up the enterprise security architecture

-- 1. Create custom ENUM types
CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED', 'DISABLED');
CREATE TYPE user_role AS ENUM ('member', 'admin', 'super_admin');

-- 2. Create the main Users Profile table (Maps 1-to-1 with auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT UNIQUE NOT NULL,
  profile_image_url TEXT,
  gender TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  tribe_number TEXT UNIQUE,
  on_chain_tx_hash TEXT UNIQUE,
  status user_status DEFAULT 'PENDING',
  role user_role DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secure the table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Admins/Super Admins can read all profiles
CREATE POLICY "Admins can view all users" 
ON public.users FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

-- Policy: Admins/Super Admins can update users (e.g. status)
CREATE POLICY "Admins can update users"
ON public.users FOR UPDATE
USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'super_admin')));

-- 3. Create the Audit Logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  performed_by UUID REFERENCES public.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Secure the table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only Admins/Super Admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'super_admin')));

-- Policy: Authenticated users can insert audit logs (the app logs their actions)
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);


-- 4. Trigger to automatically create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, phone_number, gender, address, emergency_contact_name, emergency_contact_phone, role, status)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'emergency_contact_name',
    new.raw_user_meta_data->>'emergency_contact_phone',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'member'::user_role),
    'PENDING'::user_status
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

