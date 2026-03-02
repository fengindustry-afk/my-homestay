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

async function checkRooms() {
    const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching rooms:", error.message);
    } else {
        console.log("Rooms:");
        console.table(data);
    }
}

checkRooms();
