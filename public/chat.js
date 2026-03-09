// public/chat.js

let currentRoom = null;
let messageSubscription = null;

// Load all rooms for the user
async function loadRooms() {
  const user = await app.getUser();
  if (!user) return;

  const { data, error } = await auth.supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading rooms:", error);
    return;
  }

  renderRooms(data);
}

// Render room list
function renderRooms(rooms) {
  const list = ui.qs("#room-list");
  list.innerHTML = "";

  rooms.forEach(room => {
    const div = document.createElement("div");
    div.className = "room-item";
    div.textContent = room.name;

    div.onclick = () => {
      switchRoom(room.id, room.name);
    };

    list.appendChild(div);
  });
}

// Switch to a room
async function switchRoom(roomId, roomName) {
  currentRoom = roomId;

  ui.qs("#current-room-name").textContent = roomName;

  // Unsubscribe from previous room
  if (messageSubscription) {
    auth.supabase.removeChannel(messageSubscription);
  }

  // Load messages
  await loadMessages(roomId);

  // Subscribe to realtime messages
  messageSubscription = auth.supabase
    .channel("room-" + roomId)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
      payload => {
        appendMessage(payload.new);
      }
    )
    .subscribe();
}

// Load messages for a room
async function loadMessages(roomId) {
  const { data, error } = await auth.supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading messages:", error);
    return;
  }

  renderMessages(data);
}

// Render all messages
function renderMessages(messages) {
  const box = ui.qs("#messages");
  box.innerHTML = "";

  messages.forEach(msg => appendMessage(msg));

  box.scrollTop = box.scrollHeight;
}

// Append a single message
function appendMessage(msg) {
  const box = ui.qs("#messages");

  const div = document.createElement("div");
  div.className = "message";

  div.innerHTML = `
    <strong>${msg.username || "User"}:</strong>
    <span>${msg.content}</span>
  `;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// Send a message
async function sendMessage() {
  if (!currentRoom) return;

  const input = ui.qs("#message-input");
  const text = input.value.trim();
  if (!text) return;

  const user = await app.getUser();

  const { error } = await auth.supabase.from("messages").insert({
    room_id: currentRoom,
    user_id: user.id,
    username: user.email.split("@")[0],
    content: text
  });

  if (error) {
    console.error("Error sending message:", error);
    return;
  }

  input.value = "";
}

// Create a new room
async function createRoom() {
  const name = prompt("Room name:");
  if (!name) return;

  const { error } = await auth.supabase.from("rooms").insert({
    name
  });

  if (error) {
    console.error("Error creating room:", error);
    return;
  }

  loadRooms();
}

// Initialize chat page
async function initChat() {
  await app.requireAuth();
  await loadRooms();

  ui.qs("#send-btn").onclick = sendMessage;
  ui.qs("#create-room-btn").onclick = createRoom;
}

window.chat = {
  initChat
};
