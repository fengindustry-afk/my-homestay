-- Test room validation with specific room_id
SELECT id FROM public.rooms WHERE id = 1; -- This will return nothing (invalid)

SELECT id FROM public.rooms WHERE id = 3; -- This will return the room (valid)

-- For your application, use parameterized queries like:
-- In JavaScript/TypeScript:
-- const { data: room, error } = await supabase
--   .from('rooms')
--   .select('id')
//   .eq('id', room_id)
//   .single();

-- Or in SQL with placeholders:
-- SELECT id FROM public.rooms WHERE id = ?; -- for most libraries
-- SELECT id FROM public.rooms WHERE id = $1; -- for PostgreSQL
