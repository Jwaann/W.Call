import { io } from 'socket.io-client';

/**
 * Singleton Socket.io client instance.
 * Connected on first import.
 */
const socket = io(window.location.origin, {
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: Infinity,
  transports: ['polling'],
  path: '/socket.io/',
  upgradeTimeout: 20000,
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
