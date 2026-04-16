# Quick Start Guide

## 1. Install and Run

```bash
cd jwan-call
npm install
npm run dev
```

Both the server (port 3001) and client (port 5173) will start automatically.

## 2. Open Two Browser Tabs

Open http://localhost:5173 in **two different browser tabs** (or two different browsers for a more realistic test).

- **Tab 1 (Caller)** 
- **Tab 2 (Callee)**

## 3. Grant Microphone Permission

When you load the page, your browser will ask for microphone permission. Click **Allow** in both tabs.

## 4. Make a Call

### In Tab 1:
1. Wait for your peer ID to appear (10 random alphanumeric characters)
2. Copy it (click the copy icon or select the text)

### In Tab 2 or Another Device:
1. Wait for your peer ID to appear
2. Paste the peer ID from the other client into the **"Peer ID to Call"** field
3. Click the **Call** button

### Back in Tab 1:
1. You'll see "Incoming call" with **Accept** and **Reject** buttons
2. Click **Accept**

### Call Connected!
Both tabs should now show:
- **Status:** "Connected"
- **Timer:** Call duration (MM:SS)
- **Microphone activity bar:** Visualizes audio levels in real-time
- **Hang Up button:** To end the call

## 5. Test Audio

Speak into your microphone in Tab 1 — you should hear your voice in Tab 2 (and vice versa).

## 6. Hang Up

Click **Hang Up** in either tab to end the call. Both tabs return to the dial pad.

## Testing Scenarios

### Scenario 1: Reject Call
1. In Tab 2, call Tab 1
2. In Tab 1, click **Reject**
3. In Tab 2, you should see "Call declined"

### Scenario 2: Timeout (Caller Cancels)
1. In Tab 2, call Tab 1
2. Close Tab 1 or let it sit for 30+ seconds
3. The caller (Tab 2) will eventually timeout

### Scenario 3: Disconnect During Call
1. Call is connected between Tab 1 and Tab 2
2. Close one tab abruptly
3. The other tab transitions to "Disconnected" and then "Ready to call" after 2 seconds

## Troubleshooting

**"Microphone permission denied"**
- Grant microphone permission in your browser settings (chrome://settings/content/microphone)
- Reload the page

**"Can't connect to server"**
- Verify both servers are running: `npm run dev`
- Check that port 3001 (server) and 5173 (client) are available
- Look for errors in the terminal

**"No audio heard"**
1. Verify both peers have granted microphone permission
2. Check if your microphone is working (test in another app)
3. Confirm "Connected" status and timer is running
4. Open browser console (F12) and check for WebRTC errors

**"Only hearing my own audio"**
- This is expected if you're using the same device/mic for both tabs
- Use two different devices or a headset to hear the remote side properly

## Next Steps

- **Multiple calls:** Currently, one-on-one calls only. To support multiple simultaneous calls, add session management
- **TURN server:** For calls across different networks/strict NAT, add a TURN server (see README.md)
- **Persistence:** Save call history or contacts by adding a database
- **Video:** Add video tracks to `usePeerConnection.js` for video calling

Enjoy! 🎙️
