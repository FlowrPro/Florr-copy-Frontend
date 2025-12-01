// player.js
export let player = {
  id: null,
  x: 0,
  y: 0,
  radius: 20,
  hotbar: [],
  orbitAngle: 0,
  orbitDist: 56,
  leftHeld: false,
  rightHeld: false,
  username: null,
  health: 100
};

export let orbitSpeed = 0.02;
export let extendDist = 96;
export let retractDist = 41;

let cameraX = 0, cameraY = 0;

export function updateCamera(canvas) {
  cameraX = player.x - canvas.width / 2;
  cameraY = player.y - canvas.height / 2;
}

export function getCamera() {
  return { cameraX, cameraY };
}

export function drawPlayer(ctx, p, getImage) {
  // full drawPlayer code (eyes, mouth, health bar, orbiting petals)
  // use getImage(item.image) instead of new Image()
  // … (paste your full drawPlayer implementation here, unchanged except for getImage)
}

export function drawHUD(ctx, self) {
  if (!self) return;
  const barWidth = 200, barHeight = 20, margin = 20;
  const x = ctx.canvas.width - barWidth - margin;
  const y = ctx.canvas.height - barHeight - margin;
  ctx.fillStyle = "black";
  ctx.fillRect(x, y, barWidth, barHeight);
  const healthPercent = Math.max(0, self.health) / (self.maxHealth || 100);
  ctx.fillStyle = "lime";
  ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, barWidth, barHeight);
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${self.health}/${self.maxHealth}`, x + barWidth / 2, y + barHeight - 4);
}
