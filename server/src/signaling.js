/**
 * WebRTC signaling event handlers.
 * The server acts as a pure relay: it never inspects SDP or ICE data.
 */

const roomStore = require('./roomStore');

/**
 * Helper: relay an event to the target peer.
 */
function relay(io, event, payload) {
  const targetSocketId = roomStore.lookup(payload.to);
  if (targetSocketId) {
    io.to(targetSocketId).emit(event, payload);
  }
  // Silently drop if peer not found — client handles timeout.
}

/**
 * Register all Socket.io event handlers for a connection.
 */
function setupSignaling(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    /**
     * Client registers itself with a peerId.
     * Payload: { peerId: string }
     */
    socket.on('register', (payload) => {
      const { peerId } = payload;
      roomStore.register(peerId, socket.id);
      console.log(`[Register] peerId=${peerId} → socketId=${socket.id}`);
    });

    /**
     * Caller initiates a call.
     * Payload: { from: string, to: string }
     */
    socket.on('call-request', (payload) => {
      console.log(`[CallRequest] ${payload.from} → ${payload.to}`);
      relay(io, 'incoming-call', payload);
    });

    /**
     * Callee accepts the call.
     * Payload: { from: string, to: string }
     */
    socket.on('call-accept', (payload) => {
      console.log(`[CallAccept] ${payload.from} → ${payload.to}`);
      relay(io, 'call-accepted', payload);
    });

    /**
     * Callee rejects the call.
     * Payload: { from: string, to: string }
     */
    socket.on('call-reject', (payload) => {
      console.log(`[CallReject] ${payload.from} → ${payload.to}`);
      relay(io, 'call-rejected', payload);
    });

    /**
     * Caller sends offer.
     * Payload: { from: string, to: string, sdp: RTCSessionDescription }
     */
    socket.on('offer', (payload) => {
      console.log(`[Offer] ${payload.from} → ${payload.to}`);
      relay(io, 'offer', payload);
    });

    /**
     * Callee sends answer.
     * Payload: { from: string, to: string, sdp: RTCSessionDescription }
     */
    socket.on('answer', (payload) => {
      console.log(`[Answer] ${payload.from} → ${payload.to}`);
      relay(io, 'answer', payload);
    });

    /**
     * ICE candidate trickle (both directions).
     * Payload: { from: string, to: string, candidate: RTCIceCandidate }
     */
    socket.on('ice-candidate', (payload) => {
      console.log(`[ICE] ${payload.from} → ${payload.to}`);
      relay(io, 'ice-candidate', payload);
    });

    /**
     * Either side hangs up the call.
     * Payload: { from: string, to: string }
     */
    socket.on('hang-up', (payload) => {
      console.log(`[HangUp] ${payload.from} → ${payload.to}`);
      relay(io, 'hang-up', payload);
    });

    /**
     * Client disconnects.
     */
    socket.on('disconnect', () => {
      const peerId = roomStore.removeBySocket(socket.id);
      console.log(`[Disconnect] socketId=${socket.id} peerId=${peerId}`);
    });
  });
}

module.exports = setupSignaling;
