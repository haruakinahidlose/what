document.getElementById("signup-btn").onclick = async () => {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !email || !password) {
    alert("Please fill in all fields");
    return;
  }

  // Create user with email + password
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  const user = data.user;

  // Save username in profiles
  await supabase.from("profiles").update({
    username: username
  }).eq("id", user.id);

  alert("Account created! Please log in.");
  window.location.href = "login.html";
};
