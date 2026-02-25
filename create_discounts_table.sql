-- Create discounts table for persistent storage
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.discounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id integer NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  discount_date date NOT NULL,
  percentage integer NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discounts_room_id ON public.discounts(room_id);
CREATE INDEX IF NOT EXISTS idx_discounts_date ON public.discounts(discount_date);
CREATE INDEX IF NOT EXISTS idx_discounts_room_date ON public.discounts(room_id, discount_date);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- Option 1: Disable RLS for testing (uncomment the line below)
-- ALTER TABLE public.discounts DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS with permissive policies (recommended for production)
-- Policy to allow all authenticated users to read discounts
CREATE POLICY "Users can view discounts" ON public.discounts
  FOR SELECT USING (auth.role() IN ('admin', 'authenticated'));

-- Policy to allow authenticated users to insert discounts
CREATE POLICY "Users can insert discounts" ON public.discounts
  FOR INSERT WITH CHECK (auth.role() IN ('admin', 'authenticated'));

-- Policy to allow authenticated users to update discounts
CREATE POLICY "Users can update discounts" ON public.discounts
  FOR UPDATE USING (auth.role() IN ('admin', 'authenticated'));

-- Policy to allow authenticated users to delete discounts
CREATE POLICY "Users can delete discounts" ON public.discounts
  FOR DELETE USING (auth.role() IN ('admin', 'authenticated'));
