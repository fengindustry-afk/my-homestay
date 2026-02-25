-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view discounts" ON public.discounts;
DROP POLICY IF EXISTS "Users can insert discounts" ON public.discounts;
DROP POLICY IF EXISTS "Users can update discounts" ON public.discounts;
DROP POLICY IF EXISTS "Users can delete discounts" ON public.discounts;

-- Create proper RLS policies based on custom user roles
-- Policy to allow admins and staff to read discounts
CREATE POLICY "Admins and staff can view discounts" ON public.discounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

-- Policy to allow only admins to insert discounts
CREATE POLICY "Only admins can insert discounts" ON public.discounts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy to allow only admins to update discounts
CREATE POLICY "Only admins can update discounts" ON public.discounts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy to allow only admins to delete discounts
CREATE POLICY "Only admins can delete discounts" ON public.discounts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'discounts';
