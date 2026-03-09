// public/ui.js

function qs(sel) {
  return document.querySelector(sel);
}

function qsa(sel) {
  return document.querySelectorAll(sel);
}

// Toggle sidebar (mobile)
function toggleSidebar() {
  document.body.classList.toggle("sidebar-open");
}

window.ui = {
  qs,
  qsa,
  toggleSidebar
};
