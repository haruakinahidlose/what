// src/auth.js

// A simple on‑screen logger for iPad
function debug(msg, obj) {
  try {
    const box = document.getElementById("debug-box");
    if (box) {
      box.innerText += "\n" + msg + (obj ? " " + JSON.stringify(obj) : "");
    }
  } catch (e) {}
  console.log(msg, obj || "");
}

// Initialize Supabase client (CDN version)
debug("[auth.js] Supabase global:", typeof supabase);

const client = supabase.createClient(
  "https://fnbuvfovrmezsgvrimia.supabase.co",
  "sb_publishable_RWhWEtS73XO11Ks9DqnvNw_YmG2pjwJ"
);

debug("[auth.js] Supabase client created:", client);

// Save session to localStorage
async function saveSession() {
  debug("[auth.js] saveSession() called");

  const { data, error } = await client.auth.getSession();
  debug("[auth.js] getSession() result:", { data, error });

  if (data.session) {
    localStorage.setItem("session", JSON.stringify(data.session));
    debug("[auth.js] Session saved");
  }
}

// Restore session on page load
async function restoreSession() {
  debug("[auth.js] restoreSession() called");

  const saved = localStorage.getItem("session");
  debug("[auth.js] Saved session:", saved);

  if (!saved) return null;

  const session = JSON.parse(saved);
  debug("[auth.js] Parsed session:", session);

  const { data, error } = await client.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  });

  debug("[auth.js] setSession() result:", { data, error });

  return session;
}

// Login
async function login(email, password) {
  debug("[auth.js] login() called:", { email, password });

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  debug("[auth.js] signInWithPassword() result:", { data, error });

  if (error) {
    alert("Login error: " + error.message);
    throw error;
  }

  await saveSession();
}

// Signup
async function signup
