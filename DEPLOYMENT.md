# Deployment Guide

## Development

### Local Development

```bash
cd jwan-call
npm install
npm run dev
```

This starts:
- **Server:** http://localhost:3001
- **Client:** http://localhost:5173

## Production Build

### Build the Client

```bash
npm run build --workspace=client
```

Output: `client/dist/` — ready to serve as static files

### Run Production Server

The signaling server (`server/src/index.js`) can run on any Node.js host:

```bash
cd server
npm install --production
NODE_ENV=production PORT=3001 node src/index.js
```

### Serve with a Reverse Proxy

For production, use a reverse proxy (nginx, Cloudflare, etc.) that:
1. Serves static files from `client/dist/`
2. Proxies `/socket.io/*` to the Node.js signaling server
3. Sets `Access-Control-Allow-Origin` for CORS

#### Example nginx config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve static files
    location / {
        root /path/to/client/dist;
        try_files $uri /index.html;
    }

    # Proxy WebSocket and Socket.io
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Environment Variables

- `PORT` — Signaling server port (default: 3001)
- `NODE_ENV` — Set to `production` for production builds

## Scaling Considerations

### Single Server (Current)

Suitable for small deployments:
- ~100 concurrent connections per server
- No call state persistence

### Multi-Server Setup (Future)

For larger deployments:
1. Deploy multiple signaling servers behind a load balancer
2. Add Redis for peer registry (instead of in-memory `roomStore`)
3. Use Socket.io with Redis adapter for inter-server communication
4. Implement sticky sessions so a peer's calls route to the same server

Example with Socket.io + Redis:

```javascript
// server/src/index.js
import { createAdapter } from '@socket.io/redis-adapter';

const pubClient = createClient({ host: 'redis-host' });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

## Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3001/health
# {"status":"ok"}
```

### Logs

Monitor signaling events:
```
[Socket] Client connected: ...
[Register] peerId=... → socketId=...
[CallRequest] ... → ...
[Offer] ... → ...
[Answer] ... → ...
[HangUp] ... → ...
```

Use a log aggregator (ELK, DataDog, etc.) in production.

## Security

### HTTPS/TLS

Always use HTTPS in production. WebRTC requires a secure context.

```
https://your-domain.com
```

### CORS

The server only allows the client origin. Update in `server/src/index.js`:

```javascript
const io = new SocketIOServer(server, {
  cors: {
    origin: ['https://your-domain.com'],
    methods: ['GET', 'POST'],
  },
});
```

### Rate Limiting

Consider rate-limiting the signaling server:
- Calls per peer per minute
- ICE candidates per peer per call
- Message size limits

## Backups & Data

The application has **no persistent state**:
- Peer IDs are ephemeral (10 random chars)
- No call history or user data stored
- No database required

## Disaster Recovery

If the signaling server goes down:
- Active calls disconnect
- Clients must reload and dial again
- No data loss (nothing to recover)

Restart the server:
```bash
systemctl restart jwan-call-server
```

Or with Docker:
```bash
docker stop jwan-call && docker rm jwan-call
docker run -d -p 3001:3001 --name jwan-call jwan-call:latest
```

## Docker (Optional)

### Dockerfile (Server)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY server /app
RUN npm install --production

EXPOSE 3001

CMD ["node", "src/index.js"]
```

### Docker Compose (Full Stack)

```yaml
version: '3.8'

services:
  server:
    build:
      context: .
      dockerfile: Dockerfile.server
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production

  client:
    build:
      context: .
      dockerfile: Dockerfile.client
    ports:
      - "80:80"
    depends_on:
      - server
```

## FAQ

**Q: Can I use this behind a NAT?**

A: Yes, but you need a TURN server for reliable connectivity. Without TURN, calls may fail on strict NAT or corporate firewalls.

**Q: How many concurrent calls can the server handle?**

A: The server is stateless — it just relays signaling messages. Bottleneck is typically:
- Network bandwidth (signaling + audio streams)
- CPU (negligible for signaling)
- Memory (minimal)

Estimate: ~1000 concurrent WebRTC calls on a single signaling server.

**Q: Do I need to store peer IDs?**

A: No. Peer IDs are ephemeral. Users exchange them manually (copy/paste).

**Q: Can I add user accounts?**

A: Yes. Add a database and OAuth/JWT authentication before registering a peer.

**Q: Can I add video?**

A: Yes. Modify `usePeerConnection.js` to request video tracks in `getUserMedia()` and add a video element in `App.jsx`.
