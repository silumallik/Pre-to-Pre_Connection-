PAIR — One-click screen sharing upgrade

FILES
- index.html: frontend with QR invite, room codes, auto signaling and WebRTC.
- server.js: minimal Node.js WebSocket signaling server.

LOCAL TEST
1. Install Node.js 18+.
2. In this folder run: npm install ws
3. Run: node server.js
4. Open http://localhost:3000 is NOT the app; the server is WebSocket-only.
   Serve index.html from a local static server, e.g.:
   npx http-server . -p 8080
5. Open http://localhost:8080 on both devices on the same LAN.
   On the sharing device, set signaling URL to ws://YOUR_COMPUTER_LAN_IP:3000
   (not localhost on the second device), then click Share this screen.
6. Scan the QR on the viewer device. Set the same signaling URL there.
7. Screen capture requires HTTPS for public deployment. For LAN testing, browser
   permission/security policies vary; localhost is treated as secure only on the
   same machine. Deploy the frontend over HTTPS and signaling over WSS for real use.

DEPLOY
- Deploy server.js on a host that supports persistent WebSocket connections.
- Put it behind TLS and use wss://your-domain.example in the page.
- Host index.html over HTTPS.
- Both peers must use the same signaling endpoint.

IMPORTANT
- This is a minimal demo signaling server, not production hardened.
- Room codes are short-lived in-memory IDs; server restart clears rooms.
- Add authentication, rate limits, room expiry, origin allowlists, TLS/WSS,
  monitoring, and abuse controls before public production use.
- Signaling server relays SDP/ICE metadata only. Media is carried by WebRTC
  directly when NAT/firewall conditions permit. Some networks require TURN.
- The QR library is loaded from a CDN, so QR generation needs internet access.
- Browser screen capture requires a user gesture and explicit permission.
