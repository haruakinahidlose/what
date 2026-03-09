// src/auth.js
// Authentication logic for login, signup, logout, and session handling

// --- LOGIN ---
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { error: error.message };
  }

  go("chat.html");
  return { success: true };
}

// --- SIGNUP ---
export async function signup(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    return { error: error.message };
  }

  go("chat.html");
  return { success: true };
}

// --- LOGOUT ---
export async function logoutUser() {
  await supabase.auth.signOut();
  go("login.html");
}

// --- CHECK SESSION ---
export async function requireAuth() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    go("login.html");
  }
}
