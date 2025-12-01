// game.js (updated, modular orchestrator)

import { inventory, hotbar, renderInventory, renderHotbar, setSocket as setInvSocket } from "./inventory.js";
import { setSocket as setMobSocket, setContext as setMobContext, renderMobs } from "./mob.js";

import { connectToGame, socket, otherPlayers } from "./network.js";
import { player, orbitSpeed, extendDist, retractDist, updateCamera, drawPlayer, drawHUD, getCamera } from "./player.js";
import { getImage } from "./petal.js";
import { items, renderItems } from "./items.js";
import { world, renderWorld, renderMinimap } from "./world.js";
import { setupChat } from "./ui.js";

// --- Canvas setup ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
setMobContext(ctx);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// --- Hitboxes toggle (optional UI) ---
const toggleHitboxes = document.getElementById("toggle-hitboxes");
function showHitboxesEnabled() {
  return !!toggleHitboxes && toggleHitboxes.checked;
}

// --- Input state ---
const keys = {};
document.addEventListener("keydown", e => (keys[e.key] = true));
document.addEventListener("keyup", e => (keys[e.key] = false));

// Mouse movement toggle
let mouseMovementEnabled = false;
const toggleMouse = document.getElementById("toggle-mouse");
if (toggleMouse) {
  toggleMouse.addEventListener("change", (e) => {
    mouseMovementEnabled = e.target.checked;
  });
}

// Track mouse position
let mouseX = 0, mouseY = 0;
canvas.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Mouse buttons
canvas.addEventListener("mousedown", e => {
  if (e.button === 0) player.leftHeld = true;
  if (e.button === 2) player.rightHeld = true;
});
canvas.addEventListener("mouseup", e => {
  if (e.button === 0) player.leftHeld = false;
  if (e.button === 2) player.rightHeld = false;
});
canvas.addEventListener("contextmenu", e => e.preventDefault());

// Inventory toggle
document.addEventListener("keydown", e => {
  if (e.key === "x") toggleInventory();
});
document.getElementById("invToggle")?.addEventListener("click", toggleInventory);
function toggleInventory() {
  document.getElementById("inventory")?.classList.toggle("hidden");
}

// Settings panel (preserve your behavior)
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");
const closeSettings = document.getElementById("close-settings");
settingsBtn?.addEventListener("click", () => {
  const rect = settingsBtn.getBoundingClientRect();
  settingsPanel.style.top = `${rect.bottom + 8}px`;
  settingsPanel.style.left = `${rect.left}px`;
  settingsPanel.classList.toggle("show");
});
closeSettings?.addEventListener("click", () => {
  settingsPanel.classList.remove("show");
});

// Login/register helpers (preserve endpoints)
async function loginAndConnect(username, password) {
  try {
    const res = await fetch("https://florrtest-backend-1.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!data.success || !data.token) throw new Error(data.error || "Login failed");
    localStorage.setItem("sessionToken", data.token);
    localStorage.setItem("username", username);
    connect(); // reconnect with token
  } catch (err) {
    console.error("Login error:", err);
    alert("Login failed: " + err.message);
  }
}
const registerBtn = document.getElementById("register-btn");
const loginBtn = document.getElementById("login-btn");
registerBtn?.addEventListener("click", async () => {
  const username = document.getElementById("auth-username").value.trim();
  const password = document.getElementById("auth-password").value.trim();
  if (!username || !password) return alert("Enter username and password");
  try {
    const res = await fetch("https://florrtest-backend-1.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      alert("Registered successfully! Now log in.");
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    alert("Network error: " + err.message);
  }
});
loginBtn?.addEventListener("click", () => {
  const username = document.getElementById("auth-username").value.trim();
  const password = document.getElementById("auth-password").value.trim();
  if (!username || !password) return alert("Enter username and password");
  loginAndConnect(username, password);
});

// --- Update loop ---
function update() {
  // Skip update if player not yet spawned
  if (!player || !player.id) return;

  let dx = 0, dy = 0;

  if (mouseMovementEnabled) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const diffX = mouseX - centerX;
    const diffY = mouseY - centerY;
    const dist = Math.hypot(diffX, diffY);
    if (dist > 20) {
      dx = diffX / dist;
      dy = diffY / dist;
    }
  } else {
    if (keys["w"]) dy -= 1;
    if (keys["s"]) dy += 1;
    if (keys["a"]) dx -= 1;
    if (keys["d"]) dx += 1;
  }

  // Send movement if any
  if (dx !== 0 || dy !== 0) {
    if (socket) socket.emit("move", { dx, dy });
  }

  // Orbit distance controlled per player
  if (player.leftHeld) {
    player.orbitDist = extendDist;
  } else if (player.rightHeld) {
    player.orbitDist = retractDist;
  } else {
    player.orbitDist = 56;
  }
  if (socket) socket.emit("orbit_control", { orbitDist: player.orbitDist });

  // Item collisions (pickup requests)
  items.forEach(item => {
    const dist = Math.hypot(player.x - item.x, player.y - item.y);
    if (dist < player.radius + item.radius) {
      if (socket) socket.emit("pickup_request", { itemId: item.id });
    }
  });

  updateCamera(canvas); // update camera each frame with current canvas size
}

// --- Draw loop ---
function draw() {
  // Reset and clear
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply camera offset for main world
  const { cameraX, cameraY } = getCamera();
  ctx.translate(-cameraX, -cameraY);

  // World background and bounds
  renderWorld(ctx, world);

  // --- Draw mobs ---
  renderMobs(player);

  // --- Draw players ---
  if (player.id) {
    drawPlayer(ctx, player, getImage);
  }
  Object.values(otherPlayers).forEach(p => {
    drawPlayer(ctx, p, getImage);
  });

  // --- Draw items ---
  renderItems(ctx, getImage);

  // --- Minimap ---
  renderMinimap(ctx, canvas, player, otherPlayers, world);

  // --- HUD ---
  drawHUD(ctx, player);
}

// --- Game loop ---
let gameStarted = false;
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// --- Chat UI setup ---
function initChat() {
  setupChat(socket);
}

// --- Connection orchestration ---
function connect() {
  connectToGame(setInvSocket, setMobSocket, renderInventory, renderHotbar);
  initChat();

  // Death screen events
  if (socket) {
    socket.on("player_dead", () => {
      const deathScreen = document.getElementById("death-screen");
      deathScreen?.classList.add("show");
      document.getElementById("gameCanvas")?.classList.add("blurred");
    });

    socket.on("respawn_success", () => {
      const deathScreen = document.getElementById("death-screen");
      deathScreen?.classList.remove("show");
      document.getElementById("gameCanvas")?.classList.remove("blurred");
    });

    // Start loop after first world snapshot
    socket.on("world_snapshot", () => {
      if (!gameStarted) {
        gameStarted = true;
        requestAnimationFrame(gameLoop);
      }
    });

    // Auth failures reset UI
    socket.on("auth_failed", ({ reason } = {}) => {
      console.warn("Auth failed:", reason || "unknown");
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("username");
      document.getElementById("homescreen").style.display = "block";
    });

    // Disconnect resets UI
    socket.on("disconnect", () => {
      document.getElementById("homescreen").style.display = "block";
      document.getElementById("death-screen")?.classList.add("hidden");
      document.getElementById("gameCanvas")?.classList.remove("blurred");
      for (const id of Object.keys(otherPlayers)) delete otherPlayers[id];
      Object.assign(player, { id: null, x: 0, y: 0, hotbar: [], health: 100 });
    });
  }
}

// --- Respawn button ---
const respawnBtn = document.getElementById("respawn-btn");
respawnBtn?.addEventListener("click", () => {
  if (socket) socket.emit("respawn_request");
});

// --- Boot ---
window.onload = connect;
