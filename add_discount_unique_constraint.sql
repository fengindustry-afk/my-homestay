-- Add unique constraint to discounts table to support UPSERT operations
-- and prevent duplicate discounts for the same room on the same day.

-- First, remove any existing duplicates if there are any
-- This keeps only the most recently updated record for each room and date
DELETE FROM public.discounts a
USING public.discounts b
WHERE a.id < b.id
AND a.room_id = b.room_id
AND a.discount_date = b.discount_date;

-- Add the unique constraint
ALTER TABLE public.discounts 
ADD CONSTRAINT unique_room_discount_date UNIQUE (room_id, discount_date);

-- Verify the change
COMMENT ON CONSTRAINT unique_room_discount_date ON public.discounts IS 'Ensures one discount percentage per room per date';
