let socket;
let username;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const chat = document.getElementById("chat");
const messages = document.getElementById("messages");
const chatInput = document.getElementById("chatInput");

const player = {
  x: 400, y: 300, petals: [], inventory: [], hotbar: []
};

const mobs = [
  { x: 100, y: 100, hp: 50, type: "beetle" },
  { x: 300, y: 200, hp: 30, type: "worm" }
];

function startGame() {
  username = document.getElementById("username").value;
  if (!username) return alert("Enter a username");
  document.getElementById("login").style.display = "none";
  canvas.style.display = "block";
  chat.style.display = "block";

  socket = new WebSocket("wss://your-render-backend.onrender.com");
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

  requestAnimationFrame(gameLoop);
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
    ctx.fillStyle = p.color;
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
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawMobs();
  requestAnimationFrame(gameLoop);
}
