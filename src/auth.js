// src/auth.js

// Initialize Supabase client (CDN version)
console.log("[auth.js] Loading Supabase global:", supabase);

const client = supabase.createClient(
  "https://fnbuvfovrmezsgvrimia.supabase.co",
  "sb_publishable_RWhWEtS73XO11Ks9DqnvNw_YmG2pjwJ"
);

console.log("[auth.js] Supabase client created:", client);

// Save session to localStorage
async function saveSession() {
  console.log("[auth.js] saveSession() called");
  const { data, error } = await client.auth.getSession();
  console.log("[auth.js] getSession() result:", data, error);

  if (data.session) {
    localStorage.setItem("session", JSON.stringify(data.session));
    console.log("[auth.js] Session saved to localStorage");
  }
}

// Restore session on page load
async function restoreSession() {
  console.log("[auth.js] restoreSession() called");

  const saved = localStorage.getItem("session");
  console.log("[auth.js] Saved session:", saved);

  if (!saved) return null;

  const session = JSON.parse(saved);
  console.log("[auth.js] Parsed session:", session);

  const { data, error } = await client.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  });

  console.log("[auth.js] setSession() result:", data, error);

  return session;
}

// Login
async function login(email, password) {
  console.log("[auth.js] login() called with:", email, password);

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  console.log("[auth.js] signInWithPassword() result:", data, error);

  if (error) {
    console.error("[auth.js] Login error:", error);
    throw error;
  }

  await saveSession();
}

// Signup
async function signup(email, password) {
  console.log("[auth.js] signup() called with:", email, password);

  const { data, error } = await client.auth.signUp({
    email,
    password
  });

  console.log("[auth.js] signUp() result:", data, error);

  if (error) {
    console.error("[auth.js] Signup error:", error);
    throw error;
  }
}

// Logout
async function logout() {
  console.log("[auth.js] logout() called");

  const { error } = await client.auth.signOut();
  console.log("[auth.js] signOut() result:", error);

  localStorage.removeItem("session");
  console.log("[auth.js] Session removed from localStorage");

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

console.log("[auth.js] Exported auth object:", window.auth);
