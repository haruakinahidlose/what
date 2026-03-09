const chat = {
  currentUser: null,
  currentRoom: null,
  messageSubscription: null,

  // -----------------------------
  // INIT CHAT
  // -----------------------------
  initChat: async function () {
    this.currentUser = await getCurrentUser();
    if (!this.currentUser) {
      window.location.href = "login.html";
      return;
    }

    this.loadRooms();

    document.getElementById("send-btn").onclick = () => this.sendMessage();
    document.getElementById("create-room-btn").onclick = () => this.createRoom();
  },

  // -----------------------------
  // LOAD ROOMS
  // -----------------------------
  loadRooms: async function () {
    const { data: rooms, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading rooms:", error);
      return;
    }

    const list = document.getElementById("room-list");
    list.innerHTML = "";

    rooms.forEach(room => {
      const div = document.createElement("div");
      div.className = "room-item";
      div.textContent = room.name;
      div.onclick = () => this.openRoom(room.id, room.name);
      list.appendChild(div);
    });
  },

  // -----------------------------
  // CREATE ROOM
  // -----------------------------
  createRoom: async function () {
    const name = prompt("Room name:");
    if (!name) return;

    const { error } = await supabase.from("rooms").insert({ name });

    if (error) {
      alert("Error creating room");
      return;
    }

    this.loadRooms();
  },

  // -----------------------------
  // OPEN ROOM
  // -----------------------------
  openRoom: async function (roomId, roomName) {
    this.currentRoom = roomId;

    document.getElementById("current-room-name").textContent = roomName;
    document.getElementById("messages").innerHTML = "";

    this.loadMessages(roomId);
    this.subscribeToMessages(roomId);
  },

  // -----------------------------
  // LOAD MESSAGES
  // -----------------------------
  loadMessages: async function (roomId) {
    const { data: msgs, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    msgs.forEach(msg => this.addMessage(msg));
  },

  // -----------------------------
  // REALTIME SUBSCRIPTION
  // -----------------------------
  subscribeToMessages: function (roomId) {
    if (this.messageSubscription) {
      supabase.removeChannel(this.messageSubscription);
    }

    this.messageSubscription = supabase
      .channel("room_" + roomId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        payload => this.addMessage(payload.new)
      )
      .subscribe();
  },

  // -----------------------------
  // RENDER MESSAGE
  // -----------------------------
  addMessage: function (msg) {
    const box = document.getElementById("messages");

    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `<strong>${msg.username}</strong>: ${msg.content}`;

    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  },

  // -----------------------------
  // SEND MESSAGE
  // -----------------------------
  sendMessage: async function () {
    const input = document.getElementById("message-input");
    const text = input.value.trim();
    if (!text || !this.currentRoom) return;

    await supabase.from("messages").insert({
      room_id: this.currentRoom,
      user_id: this.currentUser.id,
      username: this.currentUser.profile.username,
      content: text
    });

    input.value = "";
  }
};
