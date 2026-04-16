# W.Call Production Setup Guide

## Overview

W.Call is now ready to run as a **single-server deployment** that serves both the signaling server and the static client. This guide covers setting it up for **local network access** (same WiFi).

---

## Production Server Setup

### Quick Start

```bash
cd jwan-call

# Install dependencies (if not already done)
npm install

# Build the client for production
npm run build --workspace=client

# Start the production server
NODE_ENV=production node server/src/index.js
```

**Output should show:**
```
🚀 Signaling server running on port 3001
   Local: http://localhost:3001
   Network: http://192.168.x.x:3001
```

### What's Running

- **Signaling Server** (Express + Socket.io): Port 3001
- **Static Client** (React + Tailwind): Served from `client/dist/` via the same server
- **Everything on one port**: `http://<YOUR_IP>:3001`

---

## Connecting from Different Devices

### Device 1 (Server Machine)

1. Start the server:
   ```bash
   NODE_ENV=production node server/src/index.js
   ```

2. Note the **Network IP** from the output (e.g., `http://10.10.0.58:3001`)

3. Open in browser: `http://10.10.0.58:3001` (use YOUR IP from the output)

4. Grant microphone permission

5. **Copy your peer ID**

### Device 2 (Another Machine on Same WiFi)

1. Open the same IP in a browser: `http://10.10.0.58:3001`

2. Grant microphone permission

3. **Paste the peer ID from Device 1** into the "Peer ID to Call" field

4. Click **Call**

5. Device 1 sees "Incoming call" → Click **Accept**

6. **Audio flows peer-to-peer** between the devices! 🎵

---

## Finding Your Server IP

### Linux/Mac

```bash
# Show all network interfaces
ifconfig

# Or use hostname
hostname -I

# Or get a specific interface (example: eth0)
ifconfig eth0 | grep "inet " | awk '{print $2}'
```

### Windows

```cmd
ipconfig

# Look for "IPv4 Address" under your active network
```

### Quick Test

From the server machine, run:
```bash
curl http://localhost:3001/health
# {"status":"ok"}
```

From another machine (replace with your IP):
```bash
curl http://10.10.0.58:3001/health
# {"status":"ok"}
```

---

## Using a Static Hostname (Optional)

Instead of remembering the IP, you can use the hostname:

### Linux/Mac

```bash
# Find your hostname
hostname

# On another machine, use:
# http://your-hostname.local:3001
```

### Windows

Your hostname is usually shown as `COMPUTERNAME`:
- System Settings → About → PC name
- Then use: `http://COMPUTERNAME.local:3001`

---

## Production Environment Variables

```bash
# Port (default: 3001)
PORT=3001

# Host to bind to (default: 0.0.0.0 - all interfaces)
HOST=0.0.0.0

# Node environment
NODE_ENV=production

# Example: Start on port 8080
PORT=8080 NODE_ENV=production node server/src/index.js
```

---

## Using with a Process Manager (Recommended)

### PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start server/src/index.js --name "w-call" -- --env production

# View logs
pm2 logs w-call

# Stop
pm2 stop w-call

# Restart on reboot
pm2 startup
pm2 save
```

### systemd (Linux)

Create `/etc/systemd/system/w-call.service`:

```ini
[Unit]
Description=W.Call WebRTC Server
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/jwan-call
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node server/src/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable w-call
sudo systemctl start w-call
sudo systemctl status w-call
```

---

## Building & Deploying

### Build the Client

```bash
npm run build --workspace=client
```

Output: `client/dist/`

**The server automatically serves these files**, so no additional deployment steps needed.

### Deployment Checklist

- [x] Dependencies installed: `npm install`
- [x] Client built: `npm run build --workspace=client`
- [x] Server listens on `0.0.0.0:3001`
- [x] Static files served from `client/dist/`
- [x] CORS enabled for all origins (local network safe)
- [x] Health check working: `/health` endpoint
- [x] Test from another device on same WiFi

---

## Testing Multi-Device Calls

### Scenario 1: Laptop + Phone (Same WiFi)

1. Start server on laptop
2. Open W.Call on laptop: `http://laptop-ip:3001`
3. Copy peer ID from laptop
4. Open W.Call on phone (same WiFi): `http://laptop-ip:3001`
5. Paste laptop's peer ID
6. Click Call → Accept → Audio flows!

### Scenario 2: Three Devices

1. Start server on Device A
2. Open W.Call on Device A, B, C (all use same URL)
3. A calls B (copy ID from A, call from B)
4. A hangs up
5. B calls C (copy ID from B, call from C)
6. One-on-one calls work between any pair

### Scenario 3: Same Device, Different Browsers

For testing without multiple devices:
1. Chrome on localhost:3001
2. Firefox on localhost:3001
3. Works just like two tabs!

---

## Troubleshooting

### "Connection refused" or "Can't reach server"

**Check:**
1. Server is running: `curl http://localhost:3001/health`
2. Using correct IP: Check output of `node server/src/index.js`
3. Both devices on same WiFi
4. Firewall not blocking port 3001

**Fix:**
```bash
# Allow port 3001 in firewall
sudo ufw allow 3001  # Linux
# or via Windows Defender Firewall settings
```

### "Microphone permission denied"

**Fix:**
1. Grant permission in browser settings
2. Reload page
3. Try a different browser

### "Connected but no audio"

**Check:**
1. Both devices show "Connected" status
2. Microphone is working (test in another app)
3. Not using headphones on same device (hear yourself)
4. Browser console (F12) for WebRTC errors

**Fix:**
1. Use different devices for clearer audio
2. Check browser's mic permissions

### "Can't connect from other device"

**Verify:**
1. Both on same WiFi network
2. `ping <server-ip>` works from client device
3. Port 3001 is open: `curl http://server-ip:3001/health`
4. Server output shows the correct Network IP

---

## Monitoring

### View Server Logs

```bash
# While running in foreground
NODE_ENV=production node server/src/index.js

# Example output:
# [Socket] Client connected: ...
# [Register] peerId=... → socketId=...
# [CallRequest] ... → ...
# [Offer] ... → ...
```

### Connection Test

```bash
# From client machine
curl http://server-ip:3001/health
# {"status":"ok"}

# Check if you can reach Socket.io endpoint
curl http://server-ip:3001/socket.io/
```

---

## Security Notes

### Local Network (Same WiFi)

✅ **Safe:**
- CORS allows all origins (local network only)
- HTTP is acceptable for local testing
- No HTTPS certificate needed

⚠️ **Note:**
- Anyone on your WiFi can access W.Call
- Use a trusted network only

### Internet Access (Future Enhancement)

If you want external access:
1. **Use HTTPS** with Let's Encrypt
2. **Restrict CORS** to your domain
3. **Add rate limiting** to prevent abuse
4. **Deploy TURN server** for NAT traversal
5. **Add authentication** if needed

---

## Performance & Scaling

### Single Server Capacity

- **Concurrent users:** ~100 per server
- **Concurrent calls:** ~50 (1 call = 2 users)
- **Bandwidth:** ~100 Kbps per audio call
- **Memory:** ~50MB per active call

### For More Users

1. Run multiple server instances on different ports
2. Add load balancer (nginx) in front
3. Use Redis adapter for Socket.io state sharing
4. Deploy SFU (Selective Forwarding Unit) for group calls

---

## Updating the App

### Rebuild Client

```bash
npm run build --workspace=client
```

**Then restart the server** — it automatically serves the new files.

### Update Dependencies

```bash
npm install
npm run build --workspace=client
npm start  # Restart server
```

---

## Stopping the Server

### In Foreground

Press `Ctrl+C`

### In Background (PM2)

```bash
pm2 stop w-call
pm2 delete w-call
```

### In Background (systemd)

```bash
sudo systemctl stop w-call
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Build | `npm run build --workspace=client` |
| Start (Dev) | `npm run dev` |
| Start (Prod) | `NODE_ENV=production node server/src/index.js` |
| Health Check | `curl http://localhost:3001/health` |
| View Logs | Check the terminal output |
| Stop Server | `Ctrl+C` or `pkill -f "node server"` |

---

## Summary

✅ **W.Call is now a production-ready server**
- Single binary that serves client + signaling
- Accessible from any device on your WiFi
- No complex deployment needed
- Ready for local network testing

**To use:**
```bash
npm run build --workspace=client
NODE_ENV=production node server/src/index.js
```

**Then open:** `http://<your-ip>:3001` from any device on your WiFi!

---

For questions, see README.md or QUICKSTART.md
