import { createClient } from '@supabase/supabase-js';
import pkg from '@next/env';
const { loadEnvConfig } = pkg;

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableConstraints() {
  try {
    // Check the table definition
    const { data, error } = await supabase
      .from('information_schema.check_constraints')
      .select('*')
      .eq('constraint_schema', 'public')
      .eq('table_name', 'users');
      
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Check constraints:', data);
    }
    
    // Also check the column definition
    const { data: columns, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name, check_clause')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
      .eq('column_name', 'role');
      
    if (colError) {
      console.log('Column error:', colError);
    } else {
      console.log('Role column definition:', columns);
    }
  } catch (err) {
    console.log('Error:', err);
  }
}

checkTableConstraints();
