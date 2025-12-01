// world.js
export let world = {
  centerX: 800,
  centerY: 450,
  mapRadius: 390,
  width: 1600,
  height: 900
};

export function renderWorld(ctx, world) {
  ctx.fillStyle = "rgba(0,128,0,0.25)";
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.strokeStyle = "#0f0";
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, world.width, world.height);
}

export function renderMinimap(ctx, canvas, player, otherPlayers, world) {
  const mapWidth = 200, mapHeight = 100, margin = 20;
  const miniX = canvas.width - mapWidth - margin;
  const miniY = margin;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(miniX, miniY, mapWidth, mapHeight);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(miniX, miniY, mapWidth, mapHeight);
  const scaleX = mapWidth / (world.width || 1);
  const scaleY = mapHeight / (world.height || 1);
  const dotX = miniX + (player.x || 0) * scaleX;
  const dotY = miniY + (player.y || 0) * scaleY;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
  ctx.fill();
  Object.values(otherPlayers).forEach(p => {
    const ox = miniX + p.x * scaleX;
    const oy = miniY + p.y * scaleY;
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(ox, oy, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}
