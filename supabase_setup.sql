
-- ### TABLE: drivers ###
-- 1. Create the 'drivers' table
CREATE TABLE if not exists drivers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    vehicle_model TEXT,
    license_plate TEXT,
    insurance_verified BOOLEAN DEFAULT FALSE,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT
);

-- 2. Enable RLS for the 'drivers' table
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for the 'drivers' table
-- Policy: Allow users to view their own profile
CREATE POLICY "Allow users to view their own profile"
ON drivers
FOR SELECT
USING (auth.uid() = id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
ON drivers
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Allow authenticated users to create their own driver profile
-- This is crucial for the "Register as Driver" functionality.
CREATE POLICY "Allow authenticated users to create their own profile"
ON drivers
FOR INSERT
WITH CHECK (auth.uid() = id);


-- ### TABLE: orders ###
-- 1. Create the 'orders' table
CREATE TABLE if not exists orders (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    title TEXT,
    description TEXT,
    pickup_address TEXT,
    destination_address TEXT,
    pickup_coordinates GEOGRAPHY(POINT, 4326),
    destination_coordinates GEOGRAPHY(POINT, 4326),
    payout NUMERIC,
    currency TEXT,
    status TEXT NOT NULL DEFAULT 'Pending', -- e.g., Pending, Confirmed, driving picking up, delivering, delivered, cancelled
    delivery_type TEXT NOT NULL, -- e.g., courier, food_delivery
    driver_id UUID REFERENCES auth.users(id),
    distance TEXT,
    time TEXT,
    stops INT
);

-- 2. Enable RLS for the 'orders' table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for the 'orders' table
-- Policy: Allow authenticated users to view available 'courier' jobs that are 'Confirmed'.
-- This is the main policy for the jobs board.
DROP POLICY IF EXISTS "Allow drivers to see available jobs" ON orders;
CREATE POLICY "Allow drivers to see available jobs"
ON orders
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  status = 'Confirmed' AND
  delivery_type = 'courier'
);

-- Policy: Allow drivers to view jobs they have accepted
-- This allows a driver to see the order details after they've taken the job.
CREATE POLICY "Allow drivers to view their accepted jobs"
ON orders
FOR SELECT
USING (auth.uid() = driver_id);

-- Policy: Allow drivers to update a job they have accepted
-- This is critical for changing the status (e.g., to 'delivering', 'delivered').
-- It also includes a check to prevent drivers from "stealing" an already-taken job.
CREATE POLICY "Allow drivers to accept and update their jobs"
ON orders
FOR UPDATE
USING (auth.uid() = driver_id OR driver_id IS NULL)
WITH CHECK (auth.uid() = driver_id);


-- ### REALTIME ###
-- 1. Enable realtime for the 'orders' table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;


-- ### Functions ###
-- 1. Function to handle new user signups and create a corresponding driver profile.
-- This keeps user data synchronized between auth.users and the public.drivers table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.drivers (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger to call the function when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- To remove the trigger and function if needed:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user;
