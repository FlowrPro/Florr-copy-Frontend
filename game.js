let socket;
let username;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const chat = document.getElementById("chat");
const messages = document.getElementById("messages");
const chatInput = document.getElementById("chatInput");

const player = {
  x: 400, y: 300, petals: [], inventory: [], hotbar: [], speed: 2
};

const mobs = [
  { x: 100, y: 100, hp: 50, type: "beetle", drop: "leaf" },
  { x: 300, y: 200, hp: 30, type: "worm", drop: "fast" }
];

const petalTypes = {
  leaf: { color: "green", rarity: "common" },
  fast: { color: "yellow", rarity: "uncommon" },
  twin: { color: "blue", rarity: "rare" },
  rice: { color: "purple", rarity: "epic" },
  triplet: { color: "orange", rarity: "unique" }
};

function startGame() {
  username = document.getElementById("username").value;
  if (!username) return alert("Enter a username");
  document.getElementById("login").style.display = "none";
  canvas.style.display = "block";
  chat.style.display = "block";

  socket = new WebSocket("https://florr-copy-backend.onrender.com"); 
  socket.onopen = () => socket.send(JSON.stringify({ type: "join", username }));
  socket.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.type === "chat") {
      const div = document.createElement("div");
      div.textContent = `${data.username}: ${data.message}`;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }
  };

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      socket.send(JSON.stringify({ type: "chat", message: chatInput.value }));
      chatInput.value = "";
    }
  });

  document.addEventListener("keydown", handleKeys);
  requestAnimationFrame(gameLoop);
}

function handleKeys(e) {
  if (e.key === "ArrowUp") player.y -= player.speed;
  if (e.key === "ArrowDown") player.y += player.speed;
  if (e.key === "ArrowLeft") player.x -= player.speed;
  if (e.key === "ArrowRight") player.x += player.speed;
  if (e.key === "q") swapHotbar(-1);
  if (e.key === "e") swapHotbar(1);
}

function swapHotbar(dir) {
  if (player.hotbar.length > 1) {
    const first = player.hotbar.shift();
    player.hotbar.push(first);
  }
}

function drawPlayer() {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
  ctx.fill();
  player.petals.forEach((p, i) => {
    const angle = (i / player.petals.length) * Math.PI * 2;
    const px = player.x + Math.cos(angle) * 40;
    const py = player.y + Math.sin(angle) * 40;
    ctx.fillStyle = petalTypes[p].color;
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawMobs() {
  mobs.forEach(m => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(m.x, m.y, 15, 0, Math.PI * 2);
    ctx.fill();

    const dx = player.x - m.x;
    const dy = player.y - m.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 35) {
      m.hp -= 1;
      if (m.hp <= 0) {
        player.petals.push(m.drop);
        player.inventory.push(m.drop);
        mobs.splice(mobs.indexOf(m), 1);
      }
    }
  });
}

function drawInventory() {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(10, 10, 200, 100);
  player.inventory.forEach((p, i) => {
    ctx.fillStyle = petalTypes[p].color;
    ctx.fillRect(20 + i * 20, 20, 15, 15);
  });
}

function drawHotbar() {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(300, 550, 200, 40);
  player.hotbar.forEach((p, i) => {
    ctx.fillStyle = petalTypes[p].color;
    ctx.fillRect(310 + i * 30, 560, 20, 20);
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawMobs();
  drawInventory();
  drawHotbar();
  requestAnimationFrame(gameLoop);
}
