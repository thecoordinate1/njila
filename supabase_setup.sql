-- Supabase Setup Script for Njila Courier App
-- Version: 4
--
-- This script is idempotent, meaning it can be run multiple times safely.
-- It creates tables if they don't exist and updates policies.
--
-- Steps to run:
-- 1. Navigate to the "SQL Editor" in your Supabase project dashboard.
-- 2. Click "+ New query".
-- 3. Copy and paste the entire content of this file into the editor.
-- 4. Click "Run".

-- ========= USERS & DRIVERS =========

-- 1. Create the 'drivers' table to store driver-specific data.
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
  emergency_contact_phone TEXT
);
COMMENT ON TABLE public.drivers IS 'Stores public profile information for each user (driver).';

-- 2. Set up Row Level Security (RLS) for the 'drivers' table.
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Drivers can view their own profile." ON public.drivers;
CREATE POLICY "Drivers can view their own profile."
ON public.drivers FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Drivers can update their own profile." ON public.drivers;
CREATE POLICY "Drivers can update their own profile."
ON public.drivers FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Create a function to automatically create a profile when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.drivers (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a trigger to execute the function after a new user is created.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========= ORDERS =========

-- 5. Create the 'orders' table to store delivery jobs.
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
  status TEXT NOT NULL DEFAULT 'Pending',
  delivery_type TEXT NOT NULL DEFAULT 'self_delivery', -- 'self_delivery' or 'courier'
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL
);
COMMENT ON TABLE public.orders IS 'Stores all delivery jobs, both self-delivery and courier-based.';


-- 6. Set up RLS for the 'orders' table.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow any authenticated user to create orders.
-- This is necessary for the vendor app integration.
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
CREATE POLICY "Enable insert for authenticated users only"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (true);


-- Policy 2: Allow drivers to view orders that are pending or already assigned to them.
DROP POLICY IF EXISTS "Drivers can view their own or pending orders." ON public.orders;
CREATE POLICY "Drivers can view their own or pending orders."
ON public.orders FOR SELECT
USING (
  (status = 'Pending' AND delivery_type = 'courier') OR (driver_id = auth.uid())
);

-- Policy 3: Allow drivers to claim pending orders or update their own assigned orders.
DROP POLICY IF EXISTS "Drivers can claim pending orders and update their own." ON public.orders;
CREATE POLICY "Drivers can claim pending orders and update their own."
ON public.orders FOR UPDATE
USING (
  -- Rule applies if the order is already assigned to the current driver
  driver_id = auth.uid() OR
  -- OR if the order is a pending courier job (available to be claimed)
  (status = 'Pending' AND delivery_type = 'courier')
)
WITH CHECK (
  -- When the row is updated, the driver_id must be the current user's ID.
  -- This prevents a driver from assigning a job to someone else.
  driver_id = auth.uid()
);
COMMENT ON POLICY "Drivers can claim pending orders and update their own." ON public.orders IS 'Allows drivers to update orders they are assigned to, or to claim a pending order by setting their ID.';


-- ========= SAMPLE DATA (Optional) =========
-- You can run this section to populate the orders table with test data.
-- Make sure you have signed up at least one driver in your app first.

-- DELETE FROM public.orders; -- Clear existing orders before inserting new ones.
-- INSERT INTO public.orders (title, pickup_address, destination_address, payout, currency, distance, time, stops, status, delivery_type)
-- VALUES
-- ('Grocery Delivery', 'Kamwala Market, Lusaka', 'EastPark Mall, Lusaka', 25.50, 'ZMW', '8 km', '25 mins', 2, 'Pending', 'courier'),
-- ('Document Courier', 'Central Park, Cairo Road, Lusaka', 'Manda Hill Mall, Lusaka', 15.00, 'ZMW', '5 km', '15 mins', 1, 'Pending', 'courier'),
-- ('Pharmacy Run', 'University Teaching Hospital (UTH)', 'Arcades Shopping Mall', 30.75, 'ZMW', '12 km', '35 mins', 1, 'Pending', 'courier'),
-- ('Internal Transfer', 'Warehouse A', 'Storefront B', 0.00, 'USD', '2 km', '5 mins', 1, 'Pending', 'self_delivery');
