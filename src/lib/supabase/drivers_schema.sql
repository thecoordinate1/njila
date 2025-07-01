-- This script sets up the 'profiles' table for drivers and configures
-- it to work with Supabase Auth.
--
-- Steps to run:
-- 1. Navigate to the "SQL Editor" in your Supabase project dashboard.
-- 2. Click "+ New query".
-- 3. Copy and paste the entire content of this file into the editor.
-- 4. Click "Run".

-- 1. Create the 'profiles' table to store driver-specific data.
-- This table is linked to the 'auth.users' table.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  vehicle_model TEXT,
  license_plate TEXT,
  insurance_verified BOOLEAN DEFAULT FALSE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT
);

-- Add comments to the table and columns for clarity.
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user (driver).';
COMMENT ON COLUMN public.profiles.id IS 'Links to the auth.users table.';

-- 2. Set up Row Level Security (RLS) for the 'profiles' table.
-- This is crucial for security.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies to control access.
-- Policy 1: Allow users to view their own profile.
CREATE POLICY "Profiles are viewable by the user they belong to."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Allow users to update their own profile.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Create a function to automatically create a profile when a new user signs up.
-- This function is triggered when a new entry is added to 'auth.users'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a trigger to execute the function after a new user is created.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Set up RLS for Supabase storage (if you plan to use it for avatars).
-- This allows authenticated users to manage files in a folder named after their user ID.
-- Make sure to create a bucket named 'avatars'.

-- Policy for viewing avatars.
CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy for uploading/updating avatars.
CREATE POLICY "Anyone can upload an avatar."
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can update their own avatar."
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'avatars' );
