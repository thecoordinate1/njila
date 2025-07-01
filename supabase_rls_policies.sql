-- This script sets up Row Level Security (RLS) for the 'orders' table.
--
-- How to apply:
-- 1. In your Supabase project, navigate to the "SQL Editor".
-- 2. Click "+ New query".
-- 3. Copy the entire content of this file and paste it into the editor.
-- 4. Click "RUN".
--
-- NOTE: If you have existing policies, you may want to delete them first
-- from the Authentication > Policies section for the 'orders' table to avoid conflicts.

-- Step 1: Enable Row Level Security on the 'orders' table.
-- This is a critical first step. Without this, no policies will be enforced.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Step 2: Create policies for SELECT (reading) orders.
-- Supabase combines multiple policies for the same command (e.g., SELECT) using OR.
-- So, a user can see an order if EITHER of the following policies passes.

-- POLICY 1: Allow any authenticated driver to see available 'Pending' courier jobs.
CREATE POLICY "Allow drivers to view available courier jobs"
ON public.orders FOR SELECT
TO authenticated
USING ((delivery_type = 'courier'::text) AND (status = 'Pending'::text));

-- POLICY 2: Allow a driver to see any order that is assigned to them, regardless of status.
-- This is crucial for viewing the delivery details on the main map screen after accepting a job.
CREATE POLICY "Allow drivers to view their own assigned jobs"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = driver_id);


-- Step 3: Create policies for UPDATE (modifying) orders.
-- These policies control when a driver can change an order's status or assign it to themselves.

-- POLICY 3: Allow a driver to accept a job (update status and set their driver_id).
-- This policy allows a user to update an order ONLY IF it is currently unassigned (driver_id IS NULL)
-- and has a 'Pending' status. The WITH CHECK clause is a powerful security rule that
-- ensures the driver can only assign the job to themselves (auth.uid()).
CREATE POLICY "Allow drivers to accept available jobs"
ON public.orders FOR UPDATE
TO authenticated
USING ((status = 'Pending'::text) AND (driver_id IS NULL))
WITH CHECK (auth.uid() = driver_id);


-- POLICY 4: Allow a driver to update the status of a job they have already accepted.
-- This allows them to change the status to 'delivering', 'delivered', etc.
-- The WITH CHECK clause prevents them from re-assigning the job to another driver.
CREATE POLICY "Allow drivers to update their own assigned jobs"
ON public.orders FOR UPDATE
TO authenticated
USING (auth.uid() = driver_id)
WITH CHECK (auth.uid() = driver_id);
