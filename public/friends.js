// public/friends.js

// Load all friend-related data
async function loadFriendsPage() {
  await app.requireAuth();
  await loadFriends();
  await loadIncomingRequests();
  await loadOutgoingRequests();

  ui.qs("#send-friend-btn").onclick = sendFriendRequest;
}

// Send a friend request
async function sendFriendRequest() {
  const email = ui.qs("#friend-email").value.trim();
  if (!email) return alert("Enter an email");

  const user = await app.getUser();

  // Cannot friend yourself
  if (email === user.email) {
    alert("You cannot add yourself");
    return;
  }

  // Find target user
  const { data: target, error: findErr } = await auth.supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (findErr || !target) {
    alert("User not found");
    return;
  }

  // Insert friend request
  const { error } = await auth.supabase.from("friend_requests").insert({
    sender_id: user.id,
    receiver_id: target.id,
    status: "pending"
  });

  if (error) {
    console.error("Error sending request:", error);
    alert("Error sending request");
    return;
  }

  ui.qs("#friend-email").value = "";
  loadOutgoingRequests();
}

// Load accepted friends
async function loadFriends() {
  const user = await app.getUser();

  const { data, error } = await auth.supabase.rpc("get_friends", {
    uid: user.id
  });

  if (error) {
    console.error("Error loading friends:", error);
    return;
  }

  renderFriends(data);
}

// Render friends list
function renderFriends(list) {
  const box = ui.qs("#friends-list");
  box.innerHTML = "";

  list.forEach(f => {
    const div = document.createElement("div");
    div.className = "friend-item";
    div.textContent = f.email;
    box.appendChild(div);
  });
}

// Load incoming friend requests
async function loadIncomingRequests() {
  const user = await app.getUser();

  const { data, error } = await auth.supabase
    .from("friend_requests")
    .select("*, sender:profiles!sender_id(email)")
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  if (error) {
    console.error("Error loading incoming:", error);
    return;
  }

  renderIncomingRequests(data);
}

// Render incoming requests
function renderIncomingRequests(list) {
  const box = ui.qs("#incoming-requests");
  box.innerHTML = "";

  list.forEach(req => {
    const div = document.createElement("div");
    div.className = "request-item";

    div.innerHTML = `
      <span>${req.sender.email}</span>
      <button class="accept-btn">Accept</button>
      <button class="reject-btn">Reject</button>
    `;

    div.querySelector(".accept-btn").onclick = () => respondToRequest(req.id, "accepted");
    div.querySelector(".reject-btn").onclick = () => respondToRequest(req.id, "rejected");

    box.appendChild(div);
  });
}

// Load outgoing friend requests
async function loadOutgoingRequests() {
  const user = await app.getUser();

  const { data, error } = await auth.supabase
    .from("friend_requests")
    .select("*, receiver:profiles!receiver_id(email)")
    .eq("sender_id", user.id)
    .eq("status", "pending");

  if (error) {
    console.error("Error loading outgoing:", error);
    return;
  }

  renderOutgoingRequests(data);
}

// Render outgoing requests
function renderOutgoingRequests(list) {
  const box = ui.qs("#outgoing-requests");
  box.innerHTML = "";

  list.forEach(req => {
    const div = document.createElement("div");
    div.className = "request-item";
    div.textContent = `Pending: ${req.receiver.email}`;
    box.appendChild(div);
  });
}

// Accept or reject a request
async function respondToRequest(id, status) {
  const { error } = await auth.supabase
    .from("friend_requests")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating request:", error);
    return;
  }

  loadIncomingRequests();
  loadFriends();
}

window.friends = {
  loadFriendsPage
};
