-- Migration: Create Profiles Table
-- Description: User profiles linked to Supabase auth.users
-- This table extends the built-in auth.users with application-specific data

CREATE TABLE public.profiles (
  -- Primary key references auth.users for 1:1 relationship
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contact & Identity
  email       TEXT UNIQUE NOT NULL,
  username    TEXT UNIQUE,
  full_name   TEXT,
  
  -- Profile media
  avatar_url  TEXT,
  
  -- Onboarding tracking
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step      INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for frequently queried columns
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute on new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
