const friends = {
  currentUser: null,

  init: async function () {
    this.currentUser = await getCurrentUser();
    if (!this.currentUser) {
      window.location.href = "login.html";
      return;
    }

    this.loadFriendList();
    this.loadIncomingRequests();
    this.loadOutgoingRequests();

    document.getElementById("send-request-btn").onclick = () =>
      this.sendFriendRequest();
  },

  // -----------------------------
  // SEARCH USER BY USERNAME
  // -----------------------------
  findUserByUsername: async function (username) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("username", username)
      .single();

    if (error) return null;
    return data;
  },

  // -----------------------------
  // SEND FRIEND REQUEST
  // -----------------------------
  sendFriendRequest: async function () {
    const username = document.getElementById("friend-username").value.trim();
    if (!username) return alert("Enter a username");

    const target = await this.findUserByUsername(username);
    if (!target) return alert("User not found");

    if (target.id === this.currentUser.id)
      return alert("You cannot friend yourself");

    const { error } = await supabase.from("friend_requests").insert({
      sender_id: this.currentUser.id,
      receiver_id: target.id,
      status: "pending"
    });

    if (error) {
      alert("Request already sent or error occurred");
      return;
    }

    alert("Friend request sent!");
    this.loadOutgoingRequests();
  },

  // -----------------------------
  // LOAD INCOMING REQUESTS
  // -----------------------------
  loadIncomingRequests: async function () {
    const { data, error } = await supabase
      .from("friend_requests")
      .select("id, sender_id, profiles!friend_requests_sender_id_fkey(username)")
      .eq("receiver_id", this.currentUser.id)
      .eq("status", "pending");

    const box = document.getElementById("incoming-requests");
    box.innerHTML = "";

    if (!data || data.length === 0) {
      box.innerHTML = "<p>No incoming requests</p>";
      return;
    }

    data.forEach(req => {
      const div = document.createElement("div");
      div.className = "request-item";

      div.innerHTML = `
        <strong>${req.profiles.username}</strong>
        <button onclick="friends.acceptRequest('${req.id}')">Accept</button>
        <button onclick="friends.rejectRequest('${req.id}')">Reject</button>
      `;

      box.appendChild(div);
    });
  },

  // -----------------------------
  // LOAD OUTGOING REQUESTS
  // -----------------------------
  loadOutgoingRequests: async function () {
    const { data, error } = await supabase
      .from("friend_requests")
      .select("id, receiver_id, profiles!friend_requests_receiver_id_fkey(username)")
      .eq("sender_id", this.currentUser.id)
      .eq("status", "pending");

    const box = document.getElementById("outgoing-requests");
    box.innerHTML = "";

    if (!data || data.length === 0) {
      box.innerHTML = "<p>No outgoing requests</p>";
      return;
    }

    data.forEach(req => {
      const div = document.createElement("div");
      div.className = "request-item";

      div.innerHTML = `
        <strong>${req.profiles.username}</strong>
        <span>Pending...</span>
      `;

      box.appendChild(div);
    });
  },

  // -----------------------------
  // ACCEPT REQUEST
  // -----------------------------
  acceptRequest: async function (id) {
    await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", id);

    this.loadIncomingRequests();
    this.loadFriendList();
  },

  // -----------------------------
  // REJECT REQUEST
  // -----------------------------
  rejectRequest: async function (id) {
    await supabase
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("id", id);

    this.loadIncomingRequests();
  },

  // -----------------------------
  // LOAD FRIEND LIST
  // -----------------------------
  loadFriendList: async function () {
    const { data, error } = await supabase.rpc("get_friends", {
      uid: this.currentUser.id
    });

    const box = document.getElementById("friend-list");
    box.innerHTML = "";

    if (!data || data.length === 0) {
      box.innerHTML = "<p>No friends yet</p>";
      return;
    }

    data.forEach(friend => {
      const div = document.createElement("div");
      div.className = "friend-item";
      div.textContent = friend.username || friend.email;
      box.appendChild(div);
    });
  }
};
