import { io } from 'socket.io-client';

/**
 * Singleton Socket.io client instance.
 * Connected on first import.
 */
const socket = io(window.location.origin, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling'],
  upgrade: true,
  path: '/socket.io/',
});

socket.on('connect', () => {
  console.log('[Socket] Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('[Socket] Disconnected');
});

socket.on('connect_error', (error) => {
  console.error('[Socket] Connection error:', error);
});

export default socket;
