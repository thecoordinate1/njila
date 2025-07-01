-- This script sets up the database tables and Row Level Security (RLS) policies
-- for the Njila Driver App.
--
-- It is designed to be re-runnable. It will drop existing policies and triggers
-- before recreating them to ensure a clean setup.
--
-- Steps to run:
-- 1. Navigate to the "SQL Editor" in your Supabase project dashboard.
-- 2. Click "+ New query".
-- 3. Copy and paste the entire content of this file into the editor.
-- 4. Click "Run".

-- =================================================================
-- Section 1: Drivers Table
-- Stores profile information for drivers, linked to their auth account.
-- =================================================================

-- 1.1. Create the 'drivers' table if it doesn't exist.
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
COMMENT ON TABLE public.drivers IS 'Stores public profile information for each user (driver).';

-- 1.2. Enable Row Level Security on the 'drivers' table.
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- 1.3. Drop existing policies to ensure a clean slate.
DROP POLICY IF EXISTS "Drivers can view their own profile." ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update their own profile." ON public.drivers;

-- 1.4. Create policies for the 'drivers' table.
CREATE POLICY "Drivers can view their own profile."
ON public.drivers FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Drivers can update their own profile."
ON public.drivers FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- =================================================================
-- Section 2: Orders Table
-- Stores all delivery jobs.
-- =================================================================

-- 2.1. Create the 'orders' table if it doesn't exist.
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT,
  pickup_address TEXT NOT NULL,
  destination_address TEXT,
  payout NUMERIC(10, 2),
  currency TEXT,
  distance TEXT,
  time TEXT,
  stops INT,
  status TEXT NOT NULL DEFAULT 'Pending',
  delivery_type TEXT, -- e.g., 'courier' or 'self_delivery'
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL
);
COMMENT ON TABLE public.orders IS 'Stores details for each delivery job.';

-- 2.2. Enable Row Level Security on the 'orders' table.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2.3. Drop existing policies to ensure a clean slate.
DROP POLICY IF EXISTS "Drivers can view available or their own orders." ON public.orders;
DROP POLICY IF EXISTS "Drivers can update status on their own or available orders." ON public.orders;

-- 2.4. Create policies for the 'orders' table.
-- Policy for SELECT: Drivers can see available courier jobs OR orders already assigned to them.
CREATE POLICY "Drivers can view available or their own orders."
ON public.orders FOR SELECT
USING (
  (status = 'Pending' AND delivery_type = 'courier') OR (driver_id = auth.uid())
);

-- Policy for UPDATE: Drivers can accept a pending job by assigning it to themselves,
-- or update the status of a job they already own.
CREATE POLICY "Drivers can update status on their own or available orders."
ON public.orders FOR UPDATE
USING (
  (driver_id = auth.uid()) OR (status = 'Pending' AND delivery_type = 'courier')
)
WITH CHECK (
  driver_id = auth.uid()
);


-- =================================================================
-- Section 3: Auth Trigger for New User Profiles
-- Automatically creates a 'drivers' entry when a new user signs up.
-- =================================================================

-- 3.1. Drop existing trigger and function to ensure a clean slate.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- 3.2. Create the function.
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.drivers (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.3. Create the trigger.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================================================================
-- End of Script
-- =================================================================
