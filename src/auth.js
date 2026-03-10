// src/auth.js

// Initialize Supabase client (CDN version)
const client = supabase.createClient(
  "https://fnbuvfovrmezsgvrimia.supabase.co",
  "sb_publishable_RWhWEtS73XO11Ks9DqnvNw_YmG2pjwJ"
);

// Save session to localStorage
async function saveSession() {
  const { data } = await client.auth.getSession();
  if (data.session) {
    localStorage.setItem("session", JSON.stringify(data.session));
  }
}

// Restore session on page load
async function restoreSession() {
  const saved = localStorage.getItem("session");
  if (!saved) return null;

  const session = JSON.parse(saved);
  await client.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  });

  return session;
}

// Login
async function login(email, password) {
  const { error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  await saveSession();
}

// Signup
async function signup(email, password) {
  const { error } = await client.auth.signUp({
    email,
    password
  });

  if (error) throw error;
}

// Logout
async function logout() {
  await client.auth.signOut();
  localStorage.removeItem("session");
  window.location.href = "login.html";
}

// Export globally
window.auth = {
  supabase: client,
  login,
  signup,
  logout,
  restoreSession
};

console.log("supabase client:", client);
