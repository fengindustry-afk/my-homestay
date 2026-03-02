import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
    const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: 'bookings' });

    if (error) {
        // Fallback: try raw query if RPC fails
        console.log("RPC failed, trying direct select * limit 1");
        const { data: data2, error: error2 } = await supabase
            .from('bookings')
            .select('*')
            .limit(1);

        if (error2) {
            console.error("Error fetching bookings:", error2.message);
        } else {
            console.log("Columns found in bookings:", Object.keys(data2[0] || {}));
        }
    } else {
        console.log("Columns from RPC:", data);
    }
}

checkColumns();
