// Load current user + profile (from src/auth.js)
async function loadUser() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  return user;
}

let currentUser = null;
let currentRoom = null;

// Initialize on page load
window.onload = async () => {
  currentUser = await loadUser();
  document.getElementById("username-display").textContent =
    currentUser.profile.username;

  loadRooms();
};

// -----------------------------
// LOAD ROOMS
// -----------------------------
async function loadRooms() {
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: true });

  const list = document.getElementById("room-list");
  list.innerHTML = "";

  rooms.forEach(room => {
    const div = document.createElement("div");
    div.className = "room-item";
    div.textContent = room.name;
    div.onclick = () => openRoom(room.id);
    list.appendChild(div);
  });
}

// -----------------------------
// OPEN ROOM + LOAD MESSAGES
// -----------------------------
async function openRoom(roomId) {
  currentRoom = roomId;

  document.getElementById("messages").innerHTML = "";
  loadMessages(roomId);

  // Subscribe to realtime messages
  supabase
    .channel("room-" + roomId)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
      payload => addMessage(payload.new)
    )
    .subscribe();
}

// -----------------------------
// LOAD MESSAGES
// -----------------------------
async function loadMessages(roomId) {
  const { data: msgs } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  msgs.forEach(addMessage);
}

// -----------------------------
// RENDER MESSAGE
// -----------------------------
function addMessage(msg) {
  const box = document.getElementById("messages");

  const div = document.createElement("div");
  div.className = "message";

  div.innerHTML = `
    <strong>${msg.username}</strong>: ${msg.content}
  `;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// -----------------------------
// SEND MESSAGE
// -----------------------------
document.getElementById("send-btn").onclick = async () => {
  const text = document.getElementById("message-input").value.trim();
  if (!text || !currentRoom) return;

  await supabase.from("messages").insert({
    room_id: currentRoom,
    user_id: currentUser.id,
    username: currentUser.profile.username,
    content: text
  });

  document.getElementById("message-input").value = "";
};
