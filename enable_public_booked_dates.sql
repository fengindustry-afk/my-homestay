-- Allow public read access to paid bookings for availability checking
-- This enables customers to see booked dates and times without admin authentication

-- Drop any existing conflicting policies for public read
DROP POLICY IF EXISTS "Allow public read bookings (dev)" ON public.bookings;

-- Create policy for public read access to paid bookings only
CREATE POLICY "Allow public read paid bookings" ON public.bookings
  FOR SELECT USING (payment_status = 'paid');

-- Add time columns to bookings table if they don't exist
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS check_in_time TIMETZ,
ADD COLUMN IF NOT EXISTS check_out_time TIMETZ;

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'bookings';

-- Check the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings' AND table_schema = 'public'
ORDER BY ordinal_position;
