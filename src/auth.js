// src/auth.js

// Initialize Supabase client
const supabase = window.supabase.createClient(
  "YOUR_SUPABASE_URL",
  "YOUR_SUPABASE_ANON_KEY"
);

// Save session to localStorage
async function saveSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    localStorage.setItem("session", JSON.stringify(data.session));
  }
}

// Restore session on page load
async function restoreSession() {
  const saved = localStorage.getItem("session");
  if (!saved) return null;

  const session = JSON.parse(saved);
  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  });

  return session;
}

// Login
async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  await saveSession();
}

// Signup
async function signup(email, password) {
  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) throw error;
}

// Logout
async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem("session");
  window.location.href = "login.html";
}

// Export globally
window.auth = {
  supabase,
  login,
  signup,
  logout,
  restoreSession
};
