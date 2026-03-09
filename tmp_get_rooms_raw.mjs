
const supabaseUrl = "https://skiaybyjtdkkqitvxrli.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNraWF5YnlqdGRra3FpdHZ4cmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMjQ1MDUsImV4cCI6MjA4NjgwMDUwNX0.rA4DPZ7NQOwjGH6wS1P6RX6DRH_fyns1YqpGaGZOKWw";

async function getRooms() {
    const response = await fetch(`${supabaseUrl}/rest/v1/rooms?select=*`, {
        headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`
        }
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

getRooms();
