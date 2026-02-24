import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBookings() {
    const { data, error } = await supabase
        .from('bookings')
        .select('id, guest_name, check_in, check_out, payment_status')
        .order('check_in', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching bookings:", error.message);
    } else {
        console.log("Recent 10 bookings:");
        console.table(data);
        console.log(`Total rows returned: ${data.length}`);
    }
}

checkBookings();
