// items.js
export let items = new Map();

export function updateItems(snapshot) {
  items = new Map(snapshot.map(it => [it.id, it]));
}

export function renderItems(ctx, getImage) {
  Array.from(items.values()).forEach(item => {
    const radius = item.radius || 16;
    const img = getImage(item.image);
    if (img) {
      ctx.drawImage(img, item.x - radius, item.y - radius, radius * 2, radius * 2);
    } else {
      ctx.beginPath();
      ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = item.color || "cyan";
      ctx.fill();
    }
  });
}
