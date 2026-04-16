# W.Call — Quick Reference Card

## 🚀 Start Server

```bash
cd jwan-call
NODE_ENV=production node server/src/index.js
```

**Output shows:**
```
🚀 Signaling server running on port 3001
   Local: http://localhost:3001
   Network: http://10.10.0.58:3001
```

Use the **Network** URL from any device on your WiFi.

---

## 📱 Make a Call

### Step 1: Device A
- Open `http://10.10.0.58:3001`
- Grant microphone permission
- **Copy the Peer ID**

### Step 2: Device B
- Open `http://10.10.0.58:3001`
- Grant microphone permission
- **Paste Device A's Peer ID**
- Click **Call**

### Step 3: Device A
- Click **Accept**
- Audio flows! 🎵

---

## 📋 File Structure

```
jwan-call/
├── server/src/
│   ├── index.js           ← Signaling server + static file server
│   ├── signaling.js       ← WebRTC signaling handlers
│   └── roomStore.js       ← Peer registry
├── client/
│   ├── src/
│   │   ├── App.jsx        ← Main React component
│   │   ├── hooks/
│   │   │   └── usePeerConnection.js
│   │   ├── components/    ← UI components
│   │   └── lib/           ← Utilities
│   └── dist/              ← Built client (served by server)
└── PRODUCTION_SETUP.md    ← Detailed setup guide
```

---

## 🔧 Common Tasks

| Task | Command |
|------|---------|
| **Build client** | `npm run build --workspace=client` |
| **Start server** | `NODE_ENV=production node server/src/index.js` |
| **Dev mode** | `npm run dev` |
| **Test health** | `curl http://localhost:3001/health` |
| **Kill server** | `Ctrl+C` |

---

## 🎯 Default Values

- **Port:** 3001
- **Host:** 0.0.0.0 (all interfaces)
- **Client files:** Served from `client/dist/`
- **CORS:** Enabled for all origins (local network)

---

## 💡 Tips

1. **Multiple calls:** Each device gets a new Peer ID each session
2. **Different networks:** Calls only work on same WiFi (no TURN server)
3. **Audio quality:** Best on same LAN, ~100-300ms latency typical
4. **Mobile:** Works on iPhone/Android browsers (grant permissions)
5. **Test:** Use different browsers on same device to test

---

## ⚠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| **Can't connect** | Check both devices on same WiFi, port 3001 open |
| **No audio** | Grant microphone permission, check device mic works |
| **Connecting forever** | Page may have cached old version, hard refresh (Ctrl+Shift+R) |
| **Can't find server IP** | Run `hostname -I` on server machine |

---

## 📚 More Info

- `PRODUCTION_SETUP.md` — Full setup & deployment guide
- `README.md` — Architecture & features
- `QUICKSTART.md` — Step-by-step usage
- `DEPLOYMENT.md` — Advanced deployment options

---

## 🎙️ That's it!

You now have a production-ready peer-to-peer calling platform on your WiFi.

**Get started:**
```bash
NODE_ENV=production node server/src/index.js
```

Then open the **Network** URL from any device! 📞
