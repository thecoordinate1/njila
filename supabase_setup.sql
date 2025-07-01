-- This script configures your database tables and security policies.
-- It is designed to be safe to run multiple times. It will add missing
-- tables and columns without deleting existing data.

-- 1. Create the 'drivers' table if it doesn't exist.
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
COMMENT ON TABLE public.drivers IS 'Stores profile information for each driver, linked to their auth user.';

-- 2. Create the 'orders' table if it doesn't exist.
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
  delivery_type TEXT -- 'self_delivery' or 'courier'
);
COMMENT ON TABLE public.orders IS 'Stores all delivery jobs.';


-- 3. Add the 'driver_id' column to the 'orders' table if it's missing.
-- This ALTER TABLE command is the key fix for the "column does not exist" error.
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'driver_id') THEN
    ALTER TABLE public.orders
    ADD COLUMN driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL;
    COMMENT ON COLUMN public.orders.driver_id IS 'Links to the driver who has accepted the order.';
  END IF;
END $$;


-- 4. Enable Row Level Security (RLS) on tables.
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;


-- 5. Define RLS Policies for the 'drivers' table.
-- Dropping and recreating policies ensures they are always up-to-date.
DROP POLICY IF EXISTS "Drivers can view their own profile." ON public.drivers;
CREATE POLICY "Drivers can view their own profile."
ON public.drivers FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Drivers can update their own profile." ON public.drivers;
CREATE POLICY "Drivers can update their own profile."
ON public.drivers FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- 6. Define RLS Policies for the 'orders' table.
DROP POLICY IF EXISTS "Drivers can view available or assigned courier orders." ON public.orders;
CREATE POLICY "Drivers can view available or assigned courier orders."
ON public.orders FOR SELECT
USING (
  delivery_type = 'courier' AND (
    status = 'Pending' OR driver_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Drivers can update status of their assigned orders." ON public.orders;
CREATE POLICY "Drivers can update status of their assigned orders."
ON public.orders FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());


-- 7. Create function and trigger to auto-create a driver profile on new user signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.drivers (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Insert sample data for testing if the table is empty.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.orders) THEN
    INSERT INTO public.orders (title, pickup_address, destination_address, payout, currency, distance, time, stops, status, delivery_type)
    VALUES
    ('Grocery Delivery', 'Kamwala Market, Lusaka', 'EastPark Mall, Lusaka', 25.50, 'ZMW', '8 km', '25 mins', 2, 'Pending', 'courier'),
    ('Document Courier', 'Central Park, Cairo Road, Lusaka', 'Manda Hill Mall, Lusaka', 15.00, 'ZMW', '5 km', '15 mins', 1, 'Pending', 'courier'),
    ('Pharmacy Run', 'University Teaching Hospital (UTH)', 'Arcades Shopping Mall', 30.75, 'ZMW', '12 km', '35 mins', 1, 'Pending', 'courier'),
    ('Internal Transfer', 'Warehouse A', 'Warehouse B', 50.00, 'ZMW', '25 km', '45 mins', 1, 'Pending', 'self_delivery');
  END IF;
END $$;
