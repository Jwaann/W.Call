# W.Call — Minimal WebRTC Audio Calling Platform

A lightweight, browser-based audio calling application. No accounts, no login — just peer-to-peer calls via WebRTC with a simple, modern UI.

## Features

- **Peer-to-peer audio calls** using WebRTC
- **No authentication required** — each session has a randomly generated peer ID
- **Real-time signaling** via Socket.io and Express
- **Minimalist UI** with Tailwind CSS
- **Call controls** — accept/reject, mute/unmute, hang-up
- **Visual feedback** — call status indicator, microphone activity bar, call duration timer

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Socket.io
- **Real-time communication:** WebRTC (peer-to-peer audio), Socket.io (signaling)

## Installation & Setup

### Prerequisites

- Node.js 16+ and npm

### Install Dependencies

```bash
cd jwan-call
npm install
```

This command uses npm workspaces to install dependencies for both `server/` and `client/` in one step.

### Run Locally

```bash
npm run dev
```

This starts both the signaling server (port 3001) and Vite dev server (port 5173) concurrently.

- **Server:** http://localhost:3001 (health check: GET /health)
- **Client:** http://localhost:5173

## How to Use

1. Open http://localhost:5173 in your browser and grant microphone permission.
2. Copy your **Peer ID** (displayed at the top).
3. Open a second browser tab (or another device) and load http://localhost:5173.
4. Grant microphone permission in the second tab.
5. In the second tab, paste the peer ID from the first tab into the "Peer ID to Call" field.
6. Click **Call**.
7. In the first tab, you will see "Incoming call" with **Accept** and **Reject** buttons.
8. Click **Accept** to start the call.
9. Audio flows directly between the two browsers via WebRTC.
10. Click **Hang Up** to end the call.

## Architecture

### Server (Node.js + Socket.io)

The server is a **pure signaling relay**. It does not process SDP or ICE data; it simply routes signaling messages between peers.

**Key files:**
- `server/src/index.js` — Express + Socket.io bootstrap
- `server/src/signaling.js` — event relay handlers
- `server/src/roomStore.js` — in-memory peer registry (peerId → socketId)

**Signaling flow:**
1. Client connects and registers with a peerId
2. Caller emits `call-request` → server relays as `incoming-call` to callee
3. Callee accepts → server relays `call-accepted` back to caller
4. Caller creates WebRTC offer → server relays to callee
5. Callee creates answer → server relays to caller
6. Both sides exchange ICE candidates via server
7. WebRTC connection established → direct peer-to-peer audio

### Client (React + Vite)

**Key files:**
- `client/src/App.jsx` — root component, manages call state
- `client/src/hooks/usePeerConnection.js` — WebRTC lifecycle management
- `client/src/components/` — UI components (DialPad, CallControls, StatusBanner, etc.)
- `client/src/lib/socket.js` — Socket.io singleton
- `client/src/lib/peerIdGen.js` — peer ID generation (nanoid)

**Call flow (WebRTC):**
```
Caller:  call-request → [waiting] → call-accepted → createOffer → send offer →
Callee:  incoming-call → [user accepts] → call-accept → receive offer → createAnswer →
Both:    exchange ICE candidates → iceConnectionState = connected → audio flows
```

## Call States

- **idle** — no active call
- **calling** — caller waiting for callee to accept
- **ringing** — callee has received an incoming call
- **connecting** — SDP/ICE exchange in progress
- **connected** — call established, audio flowing
- **disconnected** — call ended (brief state before returning to idle)

## Optional Features Implemented

- **Call duration timer** — displayed once connected (MM:SS format)
- **Microphone activity bar** — real-time visualization of audio level
- **Mute toggle** — silence your microphone during an active call

## Known Limitations

### No TURN Server

This prototype uses only Google's public STUN servers (`stun.l.google.com`). For calls to work reliably:

- **Same network (LAN):** Works fine
- **Simple NAT:** Usually works
- **Strict NAT, corporate firewall, or double NAT:** May not work without a TURN server

To support more network topologies, deploy a TURN server (e.g., coturn) and add it to the RTC config in `client/src/hooks/usePeerConnection.js`:

```javascript
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' },
  ],
};
```

### No Persistence

Peer IDs are ephemeral. Reloading the page generates a new ID. There is no call history, saved contacts, or call logs.

### One-on-One Calls Only

The app supports only one active call per session. Multiple simultaneous calls would require additional state management and session isolation.

## Troubleshooting

### Microphone Permission Denied

Ensure your browser has permission to access the microphone. Clear site permissions in browser settings and reload.

### Can't Connect to Server

Verify:
1. Server is running: `npm run dev` (should show "Signaling server running on http://localhost:3001")
2. No firewall blocking port 3001
3. Vite proxy is correctly configured in `client/vite.config.js`

### Audio Not Heard

1. Verify both peers granted microphone permission
2. Check browser console for errors
3. Confirm the WebRTC connection state is "connected" (visible in console logs)
4. If on different networks, a TURN server may be needed (see "Known Limitations" above)

### Call Fails with "Failed to fetch user media"

The browser cannot access your microphone. Check:
- Microphone is plugged in and working
- Browser permissions: Settings → Privacy → Microphone
- No other app is exclusively holding the microphone

## Development

### Project Structure

```
jwan-call/
├── server/              # Node.js signaling server
│   ├── src/
│   │   ├── index.js     # Bootstrap
│   │   ├── signaling.js # Socket.io handlers
│   │   └── roomStore.js # Peer registry
│   └── package.json
├── client/              # React frontend
│   ├── src/
│   │   ├── App.jsx      # Root component
│   │   ├── hooks/       # WebRTC + audio level hooks
│   │   ├── components/  # UI components
│   │   └── lib/         # Utilities (socket, peerIdGen)
│   ├── vite.config.js   # Vite + proxy config
│   └── package.json
├── package.json         # Root with npm workspaces
└── README.md
```

### Build for Production

```bash
# Client production build
npm run build --workspace=client

# Output in client/dist/
```

To serve in production, deploy the built client to a static host and point the signaling server to a production URL.

## License

MIT

## Feedback & Contributions

This is a minimal prototype. For enhancements (call history, contact list, group calls, video support, etc.), feel free to extend it!

---

**Enjoy your peer-to-peer calls!** 🎙️
