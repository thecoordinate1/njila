--
-- IMPORTANT: This file contains the SQL to set up your database tables
-- and Row Level Security (RLS). You MUST run this script in your
-- Supabase SQL Editor to secure your application and ensure users can
-- only access their own data.
--
-- To run this:
-- 1. Go to your Supabase project dashboard.
-- 2. In the left sidebar, click on "SQL Editor".
-- 3. Click "+ New query".
-- 4. Copy the entire content of this file.
-- 5. Paste it into the SQL Editor.
-- 6. Click "RUN".
--

-- 1. Create the 'drivers' table to store driver-specific data.
-- This table is linked to the 'auth.users' table.
DROP TABLE IF EXISTS public.drivers CASCADE;
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  vehicle_model TEXT,
  license_plate TEXT,
  insurance_verified BOOLEAN DEFAULT FALSE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT
);
COMMENT ON TABLE public.drivers IS 'Stores public profile information for each user (driver).';


-- 2. Define a function to automatically create a driver profile for a new user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.drivers (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a new driver profile upon user signup.';


-- 3. Create a trigger to execute the function when a new user signs up.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4. Update the 'orders' table to link to 'drivers'.
-- This assumes your 'orders' table already exists.
-- We drop the old constraint if it exists and add the new one.
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_driver_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_driver_id_fkey
  FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL;


-- 5. Set up Row Level Security (RLS) for the 'drivers' table.
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers can view their own profile." ON public.drivers;
CREATE POLICY "Drivers can view their own profile." ON public.drivers
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Drivers can update their own profile." ON public.drivers;
CREATE POLICY "Drivers can update their own profile." ON public.drivers
  FOR UPDATE USING (auth.uid() = id);


-- 6. Set up Row Level Security (RLS) for the 'orders' table.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers can view available courier jobs." ON public.orders;
CREATE POLICY "Drivers can view available courier jobs." ON public.orders
  FOR SELECT USING (
    delivery_type = 'courier' AND status = 'Pending'
  );

DROP POLICY IF EXISTS "Drivers can view and manage their accepted jobs." ON public.orders;
CREATE POLICY "Drivers can view and manage their accepted jobs." ON public.orders
  FOR ALL USING (auth.uid() = driver_id);


-- Optional: Add some sample data for a driver profile linked to your test user.
-- Replace 'YOUR_TEST_USER_UUID' with the actual UUID of a user in your auth.users table.
-- You can find this in your Supabase dashboard under Authentication -> Users.
-- INSERT INTO public.drivers (id, full_name, email, phone, vehicle_model, license_plate, insurance_verified, emergency_contact_name, emergency_contact_phone)
-- VALUES
-- ('YOUR_TEST_USER_UUID', 'Test Driver', 'test@example.com', '123-456-7890', 'Toyota Corolla', 'ABC-123', true, 'Jane Doe', '098-765-4321')
-- ON CONFLICT (id) DO NOTHING;
