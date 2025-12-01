// network.js
import { player } from "./player.js";
import { items, updateItems } from "./items.js";
import { world } from "./world.js";

export let socket;
export let otherPlayers = {};

export function connectToGame(setSocket, setMobSocket, renderInventory, renderHotbar) {
  const token = localStorage.getItem("sessionToken");
  const username = localStorage.getItem("username");
  if (!token || !username) {
    document.getElementById("homescreen").style.display = "block";
    return;
  }
  socket = io("https://florrtest-backend-1.onrender.com");
  socket.on("connect", () => {
    socket.emit("auth", { token, username });
  });
  socket.on("auth_success", (data) => {
    document.getElementById("homescreen").style.display = "none";
    socket.emit("set_username", { username: data.username });
    setSocket(socket);
    setMobSocket(socket);
  });
  socket.on("world_snapshot", ({ world: w, self, players, items: its }) => {
    Object.assign(world, w);
    Object.assign(player, self);
    updateItems(its);
    players.forEach(p => (otherPlayers[p.id] = p));
  });
  socket.on("items_update", its => {
    items.clear();
    its.forEach(it => items.set(it.id, it));
  });
  socket.on("item_spawn", drop => {
    items.set(drop.id, drop);
  });
  socket.on("player_update", p => {
    if (p.id === socket.id) {
      Object.assign(player, p);
    } else {
      otherPlayers[p.id] = p;
    }
  });
  socket.on("player_join", p => { otherPlayers[p.id] = p; });
  socket.on("player_leave", ({ id }) => { delete otherPlayers[id]; });
}
