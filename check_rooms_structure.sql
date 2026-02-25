-- Check the structure of the rooms table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rooms' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check all rooms with available columns
SELECT * FROM public.rooms ORDER BY id LIMIT 5;
