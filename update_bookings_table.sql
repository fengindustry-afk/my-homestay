-- Add missing columns to the bookings table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS unit_name text,
ADD COLUMN IF NOT EXISTS ic_number text,
ADD COLUMN IF NOT EXISTS package_name text,
ADD COLUMN IF NOT EXISTS units_count integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON public.bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON public.bookings(check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON public.bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);

-- Also add missing columns to rooms table if they don't exist
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS basic_price numeric,
ADD COLUMN IF NOT EXISTS full_price numeric;
