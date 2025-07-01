-- ====================================================================================
-- This script sets up all necessary tables and security policies for the Njila App.
-- It is designed to be run from scratch and is safe to re-run.
--
-- How to run this script:
-- 1. Go to your Supabase project dashboard.
-- 2. In the left menu, find and click on "SQL Editor".
-- 3. Click "+ New query".
-- 4. Copy the ENTIRE content of this file and paste it into the editor.
-- 5. Click the "Run" button.
-- ====================================================================================


-- ==== 1. DRIVERS TABLE SETUP ====
-- Stores information specific to each driver, linked to their authentication record.

-- Drop the table if it exists to ensure a clean setup.
DROP TABLE IF EXISTS public.drivers CASCADE;

-- Create the table.
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
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
COMMENT ON TABLE public.drivers IS 'Stores profile information for each driver, linked to auth.users.';

-- Enable Row Level Security (RLS) for the drivers table.
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR DRIVERS TABLE
-- Policy: Drivers can see their own profile.
CREATE POLICY "Drivers can view their own profile."
ON public.drivers FOR SELECT
USING (auth.uid() = id);

-- Policy: Drivers can update their own profile.
CREATE POLICY "Drivers can update their own profile."
ON public.drivers FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ==== 2. ORDERS TABLE SETUP ====
-- Stores all delivery jobs.

-- Drop the table if it exists for a clean setup.
DROP TABLE IF EXISTS public.orders CASCADE;

-- Create the table with the essential 'driver_id' column.
CREATE TABLE public.orders (
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
  status TEXT NOT NULL DEFAULT 'Pending', -- e.g., Pending, driving picking up, delivering, delivered
  delivery_type TEXT NOT NULL DEFAULT 'self_delivery', -- 'self_delivery' or 'courier'
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL -- This links to the driver who accepted the job.
);
COMMENT ON TABLE public.orders IS 'Stores all delivery jobs available to drivers.';

-- Enable Row Level Security (RLS) for the orders table.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR ORDERS TABLE
-- Policy: Drivers can see available jobs OR jobs assigned to them.
CREATE POLICY "Drivers can view available or their own jobs."
ON public.orders FOR SELECT
USING (
  (delivery_type = 'courier' AND status = 'Pending') OR (driver_id = auth.uid())
);

-- Policy: Drivers can accept a pending job or update the status of their own job.
CREATE POLICY "Drivers can accept or update their own jobs."
ON public.orders FOR UPDATE
USING (
  (driver_id IS NULL AND status = 'Pending') OR (driver_id = auth.uid())
)
WITH CHECK (
  (driver_id IS NULL AND status = 'Pending') OR (driver_id = auth.uid())
);


-- ==== 3. AUTOMATIC PROFILE CREATION ====
-- This trigger automatically creates a driver profile when a new user signs up.

-- Drop the function if it exists to ensure the latest version is used.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function to insert a new row into public.drivers.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.drivers (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists to prevent duplicates.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to fire the function after a new user is created in auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==== 4. SAMPLE DATA (Optional) ====
-- Use this to add test jobs to your database.
-- INSERT INTO public.orders (title, pickup_address, destination_address, payout, currency, distance, time, stops, status, delivery_type)
-- VALUES
-- ('Grocery Delivery', 'Kamwala Market, Lusaka', 'EastPark Mall, Lusaka', 25.50, 'ZMW', '8 km', '25 mins', 2, 'Pending', 'courier'),
-- ('Document Courier', 'Central Park, Lusaka', 'Manda Hill Mall, Lusaka', 15.00, 'ZMW', '5 km', '15 mins', 1, 'Pending', 'courier'),
-- ('Pharmacy Run', 'UTH, Lusaka', 'Arcades Mall', 30.75, 'ZMW', '12 km', '35 mins', 1, 'Pending', 'courier');
