// public/app.js

// Redirect if not logged in
async function requireAuth() {
  const session = await auth.restoreSession();
  if (!session) {
    window.location.href = "login.html";
  }
  return session;
}

// Navigate to another page
function go(page) {
  window.location.href = page;
}

// Get current user
async function getUser() {
  const { data } = await auth.supabase.auth.getUser();
  return data.user;
}

window.app = {
  requireAuth,
  go,
  getUser
};
