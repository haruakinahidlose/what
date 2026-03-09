// chat.js
// Handles rooms, messages, and realtime updates

let currentRoom = null;

// Load rooms on page load
window.onload = async () => {
  await checkAuth();
  loadRooms();
};

// Load all chat rooms from Supabase
async function loadRooms() {
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error loading rooms:", error);
    return;
  }

  const roomList = document.getElementById("room-list");
  roomList.innerHTML = "";

  rooms.forEach(room => {
    const div = document.createElement("div");
    div.className = "room-item";
    div.textContent = room.name;
    div.onclick = () => joinRoom(room.id);
    roomList.appendChild(div);
  });
}

// Join a room
async function joinRoom(roomId) {
  currentRoom = roomId;
  document.getElementById("messages").innerHTML = "";
  loadMessages(roomId);
  subscribeToMessages(roomId);
}

// Load messages for a room
async function loadMessages(roomId) {
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading messages:", error);
    return;
  }

  const msgBox = document.getElementById("messages");
  msgBox.innerHTML = "";

  messages.forEach(addMessageToUI);
}

// Add a message to the UI
function addMessageToUI(msg) {
  const msgBox = document.getElementById("messages");

  const div = document.createElement("div");
  div.className = "message";
  div.textContent = `${msg.username}: ${msg.text}`;

  msgBox.appendChild(div);
  msgBox.scrollTop = msgBox.scrollHeight;
}

// Send a message
async function sendMessage() {
  if (!currentRoom) return;

  const input = document.getElementById("messageBox");
  const text = input.value.trim();
  if (!text) return;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  await supabase.from("messages").insert({
    room_id: currentRoom,
    text,
    username: user.email
  });

  input.value = "";
}

// Realtime subscription
let subscription = null;

function subscribeToMessages(roomId) {
  if (subscription) {
    supabase.removeChannel(subscription);
  }

  subscription = supabase
    .channel("room_" + roomId)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
      payload => {
        addMessageToUI(payload.new);
      }
    )
    .subscribe();
}
