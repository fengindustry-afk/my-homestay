import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let supabaseUrl, supabaseServiceKey;

try {
    const env = fs.readFileSync('.env.local', 'utf8');
    supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
    supabaseServiceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1];
} catch (e) {
    console.error("Could not read .env.local");
}

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    console.log("Checking columns for 'bookings' table...");
    const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .limit(1);

    if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError.message);
    } else {
        console.log("Bookings columns:", Object.keys(bookingsData[0] || {}));
    }

    console.log("\nChecking columns for 'rooms' table...");
    const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .limit(1);

    if (roomsError) {
        console.error("Error fetching rooms:", roomsError.message);
    } else {
        console.log("Rooms columns:", Object.keys(roomsData[0] || {}));
    }
}

checkSchema();
