// public/app.js
// Base Supabase setup + session utilities

// IMPORTANT:
// Replace these with your real values OR rely on Vercel env vars.
// If using Vercel env vars, they will be injected automatically.

const SUPABASE_URL = window.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const SUPABASE_KEY = window.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

// Create Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Redirect helper
function go(path) {
  window.location.href = path;
}

// Check if user is logged in (use this on protected pages like chat.html)
async function checkAuth() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    go("login.html");
  }
}

// Logout function
async function logout() {
  await supabaseClient.auth.signOut();
  go("login.html");
}

// Expose globally so other scripts can use it
window.supabase = supabaseClient;
window.checkAuth = checkAuth;
window.logout = logout;
window.go = go;
