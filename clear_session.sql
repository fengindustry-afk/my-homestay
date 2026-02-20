-- Clear all existing sessions to start fresh
DELETE FROM auth.sessions WHERE true;

-- Verify no sessions exist
SELECT COUNT(*) as session_count FROM auth.sessions;
