-- Drop ALL existing policies on discounts table
DROP POLICY IF EXISTS "Users can view discounts" ON public.discounts;
DROP POLICY IF EXISTS "Users can insert discounts" ON public.discounts;
DROP POLICY IF EXISTS "Users can update discounts" ON public.discounts;
DROP POLICY IF EXISTS "Users can delete discounts" ON public.discounts;
DROP POLICY IF EXISTS "Admins and staff can view discounts" ON public.discounts;
DROP POLICY IF EXISTS "Only admins can insert discounts" ON public.discounts;
DROP POLICY IF EXISTS "Only admins can update discounts" ON public.discounts;
DROP POLICY IF EXISTS "Only admins can delete discounts" ON public.discounts;

-- Create fresh, simple RLS policies
-- Allow admins to do everything
CREATE POLICY "Admins can manage discounts" ON public.discounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow staff to view only
CREATE POLICY "Staff can view discounts" ON public.discounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'staff'
    )
  );

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'discounts';
