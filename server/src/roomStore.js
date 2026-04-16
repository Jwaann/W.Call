/**
 * In-memory registry of peers: peerId -> socketId
 */

class RoomStore {
  constructor() {
    this.store = new Map();
  }

  register(peerId, socketId) {
    this.store.set(peerId, socketId);
  }

  lookup(peerId) {
    return this.store.get(peerId) || null;
  }

  removeBySocket(socketId) {
    for (const [peerId, sid] of this.store.entries()) {
      if (sid === socketId) {
        this.store.delete(peerId);
        return peerId;
      }
    }
    return null;
  }

  size() {
    return this.store.size;
  }
}

module.exports = new RoomStore();
