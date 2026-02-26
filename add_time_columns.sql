-- Add missing time columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS check_in_time TEXT DEFAULT '15:00',
ADD COLUMN IF NOT EXISTS check_out_time TEXT DEFAULT '12:00';

-- Update existing records if they have null times
UPDATE public.bookings 
SET check_in_time = '15:00' 
WHERE check_in_time IS NULL;

UPDATE public.bookings 
SET check_out_time = '12:00' 
WHERE check_out_time IS NULL;
