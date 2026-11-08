// PAIR signaling server — Node.js 18+
// Install: npm install ws
// Run: node server.js
// Production: put this behind HTTPS/WSS (e.g. Nginx/Caddy).
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });
const rooms = new Map();

function send(ws, data) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}
function leave(ws) {
  const room = ws.room;
  if (!room) return;
  const peers = rooms.get(room);
  if (peers) {
    peers.delete(ws);
    for (const peer of peers) send(peer, { type: "peer-left" });
    if (peers.size === 0) rooms.delete(room);
  }
  ws.room = null;
}
wss.on("connection", ws => {
  ws.on("message", raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); }
    catch { return send(ws, { type: "error", message: "Invalid message" }); }

    if (msg.type === "create") {
      if (typeof msg.room !== "string" || !/^[A-Z0-9]{6}$/.test(msg.room))
        return send(ws, { type: "error", message: "Invalid room code" });
      if (rooms.has(msg.room)) return send(ws, { type: "error", message: "Room code already exists. Try again." });
      rooms.set(msg.room, new Set([ws]));
      ws.room = msg.room;
      send(ws, { type: "created", room: msg.room });
      return;
    }
    if (msg.type === "join") {
      const peers = rooms.get(msg.room);
      if (!peers || peers.size !== 1)
        return send(ws, { type: "error", message: "Room not found or already occupied." });
      peers.add(ws); ws.room = msg.room;
      const host = [...peers].find(p => p !== ws);
      send(ws, { type: "joined", room: msg.room });
      send(host, { type: "peer-joined", room: msg.room });
      return;
    }
    if (msg.type === "leave") { leave(ws); return; }

    // Relay only WebRTC signaling metadata to the other peer in this room.
    const peers = rooms.get(ws.room);
    if (!peers) return;
    for (const peer of peers) if (peer !== ws) send(peer, msg);
  });
  ws.on("close", () => leave(ws));
  ws.on("error", () => leave(ws));
});
console.log("PAIR signaling server listening on ws://localhost:3000");
