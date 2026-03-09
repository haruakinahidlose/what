// ui.js
// Handles UI updates for chat, friends, requests, etc.

// ===== DOM Helpers =====
function $(id) {
  return document.getElementById(id);
}

function create(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

// ===== FRIEND REQUEST UI =====

// Render incoming friend requests
async function renderIncomingRequests() {
  const list = $("incoming-requests");
  if (!list) return;

  list.innerHTML = "";

  const requests = await getIncomingRequests();
  requests.forEach(req => {
    const row = create("div", "request-row");

    const name = create("span", "request-name", req.sender);
    const accept = create("button", "request-accept", "Accept");
    const reject = create("button", "request-reject", "Reject");

    accept.onclick = async () => {
      await acceptFriendRequest(req.id);
      renderIncomingRequests();
      renderFriends();
    };

    reject.onclick = async () => {
      await rejectFriendRequest(req.id);
      renderIncomingRequests();
    };

    row.appendChild(name);
    row.appendChild(accept);
    row.appendChild(reject);

    list.appendChild(row);
  });
}

// Render outgoing friend requests
async function renderOutgoingRequests() {
  const list = $("outgoing-requests");
  if (!list) return;

  list.innerHTML = "";

  const requests = await getOutgoingRequests();
  requests.forEach(req => {
    const row = create("div", "request-row");
    row.textContent = `Pending → ${req.receiver}`;
    list.appendChild(row);
  });
}

// Render friend list
async function renderFriends() {
  const list = $("friend-list");
  if (!list) return;

  list.innerHTML = "";

  const friends = await getFriends();
  friends.forEach(email => {
    const row = create("div", "friend-row", email);
    list.appendChild(row);
  });
}

// ===== SEND FRIEND REQUEST =====
async function handleSendFriendRequest() {
  const input = $("friend-email");
  const email = input.value.trim();
  if (!email) return;

  const result = await sendFriendRequest(email);

  if (result.error) {
    alert(result.error);
  } else {
    alert("Friend request sent");
    renderOutgoingRequests();
  }

  input.value = "";
}

// ===== INITIALIZE UI =====
async function initUI() {
  if ($("incoming-requests")) renderIncomingRequests();
  if ($("outgoing-requests")) renderOutgoingRequests();
  if ($("friend-list")) renderFriends();

  const sendBtn = $("send-friend-btn");
  if (sendBtn) sendBtn.onclick = handleSendFriendRequest;
}

// Run UI setup after page loads
window.addEventListener("load", initUI);

// Expose helpers if needed
window.renderFriends = renderFriends;
window.renderIncomingRequests = renderIncomingRequests;
window.renderOutgoingRequests = renderOutgoingRequests;
