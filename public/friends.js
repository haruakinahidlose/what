// friends.js
// Handles friend requests + friend list using Supabase

// Send a friend request
async function sendFriendRequest(targetEmail) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not logged in" };

  const { error } = await supabase.from("friend_requests").insert({
    sender: user.email,
    receiver: targetEmail,
    status: "pending"
  });

  if (error) return { error: error.message };
  return { success: true };
}

// Get incoming friend requests
async function getIncomingRequests() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("friend_requests")
    .select("*")
    .eq("receiver", user.email)
    .eq("status", "pending");

  if (error) return [];
  return data;
}

// Get outgoing friend requests
async function getOutgoingRequests() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("friend_requests")
    .select("*")
    .eq("sender", user.email)
    .eq("status", "pending");

  if (error) return [];
  return data;
}

// Accept a friend request
async function acceptFriendRequest(requestId) {
  const { error } = await supabase
    .from("friend_requests")
    .update({ status: "accepted" })
    .eq("id", requestId);

  if (error) return { error: error.message };
  return { success: true };
}

// Reject a friend request
async function rejectFriendRequest(requestId) {
  const { error } = await supabase
    .from("friend_requests")
    .update({ status: "rejected" })
    .eq("id", requestId);

  if (error) return { error: error.message };
  return { success: true };
}

// Get all accepted friends
async function getFriends() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("friend_requests")
    .select("*")
    .or(`sender.eq.${user.email},receiver.eq.${user.email}`)
    .eq("status", "accepted");

  if (error) return [];

  // Convert rows into a list of friend emails
  return data.map(req =>
    req.sender === user.email ? req.receiver : req.sender
  );
}

// Expose globally
window.sendFriendRequest = sendFriendRequest;
window.getIncomingRequests = getIncomingRequests;
window.getOutgoingRequests = getOutgoingRequests;
window.acceptFriendRequest = acceptFriendRequest;
window.rejectFriendRequest = rejectFriendRequest;
window.getFriends = getFriends;
