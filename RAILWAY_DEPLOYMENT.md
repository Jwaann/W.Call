# W.Call Deployment to Railway.app

## Why Railway?

- ✅ **Automatic HTTPS** — Required for WebRTC `getUserMedia()`
- ✅ **Public URL** — Works from anywhere on any network
- ✅ **Node.js Support** — Native support for Express + Socket.io
- ✅ **Free tier** — Start with free credits (limited but great for testing)
- ✅ **Simple deployment** — Connect GitHub repo and auto-deploy
- ✅ **Environment variables** — Automatic PORT injection

## Prerequisites

1. **GitHub Account** (to store your code)
2. **Railway Account** (free signup at railway.app)
3. **Git** installed locally

---

## Step 1: Prepare Your Code

The code is already configured for Railway. Verify:

```bash
# Build and test locally
npm install
npm run build
npm start

# Should show:
# 🚀 Signaling server running on port 3001
# Open http://localhost:3001 in browser
```

If that works, you're ready to deploy!

---

## Step 2: Push Code to GitHub

### Create a GitHub repo

```bash
# Initialize git (if not already done)
git init

# Add files
git add .

# Commit
git commit -m "Initial W.Call commit - ready for Railway deployment"

# Create repo on github.com and add remote
git remote add origin https://github.com/YOUR_USERNAME/w-call.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Railway

### 1. Go to [railway.app](https://railway.app)

### 2. Sign up or log in

### 3. Create new project

- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Click **"Configure GitHub App"** if prompted
- Select your `w-call` repo

### 4. Railway auto-detects Node.js

- Railway reads `railway.json` (which we created)
- Build command: `npm install && npm run build`
- Start command: `npm start`

### 5. Wait for deployment

- Watch the build logs (should show Vite build output)
- Watch the deploy logs (should show "Signaling server running on port ...")
- When green ✅, deployment is complete

### 6. Get your public URL

- Railway displays your URL: `https://w-call-[random].up.railway.app`
- This is your public endpoint!

---

## Step 4: Test Your Deployment

### Device 1: Open in browser

```
https://w-call-[random].up.railway.app
```

Grant microphone permission, copy your Peer ID.

### Device 2: Open the SAME URL in another browser/device

```
https://w-call-[random].up.railway.app
```

Grant microphone permission, paste Device 1's Peer ID, click Call.

**Audio should flow! 🎵**

---

## How It Works on Railway

```
Railway Container (Your Server)
│
├─ Node.js process running "npm start"
│  └─ Starts server/src/index.js
│
├─ Express server on PORT 3000 (Railway injects this)
│
├─ Serves static client from client/dist/
│
└─ Socket.io signaling server
   └─ Clients connect via WebSocket
   └─ ICE candidates, offer/answer exchanged
   └─ Audio flows peer-to-peer (not through Railway)

Browser A                         Browser B
   │                                │
   ├─HTTP GET https://...      ─────┤
   │ (downloads W.Call UI)         │
   │                                │
   │<─── WebSocket (Socket.io) ────>│
   │  (signaling only)              │
   │                                │
   └──────────────────────────────>│
        WebRTC P2P Audio
        (direct, not through Railway)
```

**Key point:** Audio is P2P, signaling is on Railway. This minimizes bandwidth/latency cost.

---

## Updating Your Code

After deployment, if you make changes:

```bash
# Make code changes
# Run locally to test
npm run build
npm start

# If everything works:
git add .
git commit -m "Update: [describe changes]"
git push origin main

# Railway auto-deploys when you push!
```

---

## Monitoring & Logs

### View Railway logs

1. Go to your Railway project
2. Click "Logs"
3. See real-time server output

```
🚀 Signaling server running on port 3000
[Socket] Client connected: ...
[Register] peerId=... → socketId=...
[CallRequest] ... → ...
```

---

## Environment Variables (Optional)

Railway provides some env vars automatically:
- `PORT` — Set by Railway (usually 3000)
- `NODE_ENV` — Set to `production` by default

To add custom variables:

1. Go to Railway project → Settings → Variables
2. Add any you need (currently none needed for W.Call)
3. Changes auto-redeploy

---

## Troubleshooting Railway Deployment

### Build fails

Check **Deploy** tab → **Build Logs**

Common issues:
- Missing `package.json` → ensure root `package.json` exists
- `npm run build` fails → test locally: `npm install && npm run build`
- Monorepo issues → railway.json should fix this

### Deploy succeeds but page 404s

- Check **Logs** tab
- If you see `client/dist not found`, the build didn't run properly
- Verify `railway.json` is in root directory

### Microphone not working

Probably a browser permission issue (not Railway):
- Grant microphone permission in browser settings
- Try in Incognito/Private mode
- Test with `https://` (not `http://`)

### Can't connect between two devices

- Both devices should work on same `https://w-call-[random].up.railway.app` URL
- Check browser console (F12) for WebRTC errors
- If different geographic locations, might need TURN server (future enhancement)

---

## Performance & Costs

### Free tier (Railway credits)

- **Included:** 5GB storage, 500 hours/month compute
- **Cost:** $0.000463/hour after credits used (~$0.003/minute)
- **For W.Call:** ~$5-10/month if always running

### Optimize costs

- Use Railway's auto-pause (put server to sleep after inactivity)
- Deploy only when needed
- Consider as always-on after 1-2 months

---

## Scaling (Future)

Current setup handles:
- ✅ ~100 concurrent users
- ✅ ~50 simultaneous calls

If you need more:
1. Scale Railway service (auto-scaling available)
2. Add TURN server (for NAT traversal)
3. Switch to SFU (Selective Forwarding Unit) for group calls

---

## Security

### HTTPS
✅ Automatic via Railway

### CORS
Currently allows `*` origin (safe on local network, but update for production):

Edit `server/src/index.js`:
```js
cors: {
  origin: 'https://your-domain.com',  // restrict to your domain
}
```

### Authentication (Optional)
Could add user accounts later, but not required for basic functionality.

---

## Next Steps

1. **Test locally:** `npm install && npm run build && npm start`
2. **Push to GitHub:** Create repo and push
3. **Deploy to Railway:** Connect repo, watch it deploy
4. **Test with friends:** Share your Railway URL
5. **Monitor:** Check logs if issues arise

---

## Quick Reference

| Action | Command |
|--------|---------|
| Local test | `npm install && npm run build && npm start` |
| Push updates | `git add . && git commit -m "..." && git push` |
| View logs | Railway dashboard → Logs |
| Update code | Make changes, push to GitHub, Railway auto-deploys |

---

## Support

- Railway docs: https://docs.railway.app
- W.Call GitHub: Your repo URL
- Issues: Check Railway logs or local reproduction

---

**You're all set! Deploy W.Call to the world! 🚀**
