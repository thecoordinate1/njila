-- Supabase Njila App Setup Script
--
-- This script configures all the necessary tables, security policies (RLS),
-- and database functions for the Njila courier application.
--
-- To use this script:
-- 1. Navigate to the "SQL Editor" in your Supabase project dashboard.
-- 2. Click "+ New query".
-- 3. Copy and paste the entire content of this file into the editor.
-- 4. Click "Run".
--
-- This script can be run multiple times safely. It uses "CREATE OR REPLACE"
-- and "IF NOT EXISTS" to avoid errors on subsequent runs.

-- 1. DRIVERS TABLE
-- Stores profile information for drivers, linked to their authentication record.
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  vehicle_model TEXT,
  license_plate TEXT,
  insurance_verified BOOLEAN DEFAULT FALSE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  member_since TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.drivers IS 'Stores public profile information for each user (driver).';

-- Enable Row Level Security (RLS) on the drivers table.
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Clean up old policies before creating new ones.
DROP POLICY IF EXISTS "Drivers can view their own profile." ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update their own profile." ON public.drivers;

-- Create RLS policies for the drivers table.
CREATE POLICY "Drivers can view their own profile."
ON public.drivers FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Drivers can update their own profile."
ON public.drivers FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. ORDERS TABLE
-- Stores information about all delivery jobs.
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT,
  pickup_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  payout NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  distance TEXT,
  time TEXT,
  stops INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Pending', -- e.g., Pending, driving picking up, delivering, delivered, cancelled
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  delivery_type TEXT -- e.g., courier, self_delivery
);
COMMENT ON TABLE public.orders IS 'Stores all delivery jobs for the platform.';

-- Enable Row Level Security (RLS) on the orders table.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Clean up old policies before creating new ones.
DROP POLICY IF EXISTS "Drivers can view available jobs." ON public.orders;
DROP POLICY IF EXISTS "Drivers can update status for their assigned jobs." ON public.orders;

-- Create RLS policies for the orders table.
CREATE POLICY "Drivers can view available jobs."
ON public.orders FOR SELECT
USING (
  (delivery_type = 'courier' AND status = 'Pending') OR (driver_id = auth.uid())
);

CREATE POLICY "Drivers can update status for their assigned jobs."
ON public.orders FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());


-- 3. FUNCTION TO AUTO-CREATE A DRIVER PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new row into the public.drivers table
  -- with the ID and metadata from the new user.
  INSERT INTO public.drivers (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TRIGGER TO EXECUTE THE FUNCTION AFTER A NEW USER IS CREATED
-- This connects the function to the auth.users table.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. OPTIONAL: SEED DATA FOR TESTING
-- Insert some sample orders to test the "Available Jobs" page.
-- You can comment this out or remove it for production.
-- DO NOT RUN a second time if you have existing data, it might fail or create duplicates.
-- INSERT INTO public.orders (title, pickup_address, destination_address, payout, currency, distance, time, stops, status, delivery_type)
-- VALUES
-- ('Grocery Delivery', 'Kamwala Market, Lusaka', 'EastPark Mall, Lusaka', 25.50, 'ZMW', '8 km', '25 mins', 2, 'Pending', 'courier'),
-- ('Document Courier', 'Central Park, Cairo Road, Lusaka', 'Manda Hill Mall, Lusaka', 15.00, 'ZMW', '5 km', '15 mins', 1, 'Pending', 'courier'),
-- ('Pharmacy Run', 'University Teaching Hospital (UTH)', 'Arcades Shopping Mall', 30.75, 'ZMW', '12 km', '35 mins', 1, 'Pending', 'courier');

-- End of script
