// src/auth.js

function debug(msg, obj) {
  try {
    const box = document.getElementById("debug-box");
    if (box) {
      box.innerText += "\n" + msg + (obj ? " " + JSON.stringify(obj) : "");
    }
  } catch (e) {}
  console.log(msg, obj || "");
}

debug("[auth.js] Loaded auth.js file");

// Check Supabase global
debug("[auth.js] Supabase global type:", typeof supabase);

// Create client
const client = supabase.createClient(
  "https://fnbuvfovrmezsgvrimia.supabase.co",
  "sb_publishable_RWhWEtS73XO11Ks9DqnvNw_YmG2pjwJ"
);

debug("[auth.js] Supabase client created:", client);

// Save session
async function saveSession() {
  debug("[auth.js] saveSession() called");

  const { data, error } = await client.auth.getSession();
  debug("[auth.js] getSession() result:", { data, error });

  if (data.session) {
    localStorage.setItem("session", JSON.stringify(data.session));
    debug("[auth.js] Session saved");
  }
}

// Restore session
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
async function signup(email, password) {
  debug("[auth.js] signup() called:", { email, password });

  const { data, error } = await client.auth.signUp({
    email,
    password
  });

  debug("[auth.js] signUp() result:", { data, error });

  if (error) {
    alert("Signup error: " + error.message);
    throw error;
  }
}

// Logout
async function logout() {
  debug("[auth.js] logout() called");

  const { error } = await client.auth.signOut();
  debug("[auth.js] signOut() result:", error);

  localStorage.removeItem("session");
  debug("[auth.js] Session removed");

  window.location.href = "login.html";
}

// Export
window.auth = {
  supabase: client,
  login,
  signup,
  logout,
  restoreSession
};

debug("[auth.js] Exported auth object:", window.auth);
