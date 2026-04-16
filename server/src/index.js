const express = require('express');
const http = require('http');
const path = require('path');
const { Server: SocketIOServer } = require('socket.io');
const cors = require('cors');

const setupSignaling = require('./signaling');

const app = express();
const server = http.createServer(app);

// Allow CORS from any origin (for development)
// In production, restrict this to your domain
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['polling'],
  pingTimeout: 120000,
  pingInterval: 30000,
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from client/dist if it exists
const distPath = path.join(__dirname, '../../client/dist');
try {
  app.use(express.static(distPath));
} catch (err) {
  console.log('[Server] Note: client/dist not found. Run "npm run build --workspace=client" to build the frontend.');
}

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Setup all signaling handlers
setupSignaling(io);

// Serve index.html for all non-API routes (SPA support)
// This must be after all other routes to catch unmatched paths
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ status: 'W.Call server running, client not built' });
    }
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  const localIp = require('os').networkInterfaces();
  const ipAddresses = Object.values(localIp)
    .flat()
    .filter(addr => addr.family === 'IPv4' && !addr.internal)
    .map(addr => addr.address);

  console.log(`\n🚀 Signaling server running on port ${PORT}`);
  console.log(`   Local: http://localhost:${PORT}`);
  if (ipAddresses.length > 0) {
    ipAddresses.forEach(ip => {
      console.log(`   Network: http://${ip}:${PORT}`);
    });
  }
  console.log('');
});
