/**
 * Voice Chat Handler — WebRTC Signaling via Socket.IO
 *
 * Manages voice channel membership per room and relays
 * SDP offers/answers + ICE candidates between peers.
 */

// In-memory voice channel state: roomCode -> Set of voice users
const voiceRooms = new Map();

/**
 * Get the voice users for a room
 * @param {string} roomCode
 * @returns {Array} array of { socketId, userId, name, avatarUrl }
 */
function getVoiceUsers(roomCode) {
  const set = voiceRooms.get(roomCode);
  return set ? Array.from(set.values()) : [];
}

/**
 * Remove a user from the voice channel of a room
 * @param {string} roomCode
 * @param {string} socketId
 * @returns {object|null} the removed user, or null
 */
function removeVoiceUser(roomCode, socketId) {
  const set = voiceRooms.get(roomCode);
  if (!set) return null;

  let removed = null;
  for (const user of set) {
    if (user.socketId === socketId) {
      removed = user;
      set.delete(user);
      break;
    }
  }

  // Clean up empty rooms
  if (set.size === 0) {
    voiceRooms.delete(roomCode);
  }

  return removed;
}

/**
 * Register voice chat socket events on a connected socket.
 * Called from within the main io.on("connection") block.
 *
 * @param {import("socket.io").Server} io
 * @param {import("socket.io").Socket} socket
 */
export function registerVoiceEvents(io, socket) {
  // ─── JOIN VOICE CHANNEL ───────────────────────────────────
  socket.on("voice:join", ({ roomCode }, callback) => {
    if (!roomCode || !socket.user) {
      return callback?.({ success: false, message: "Invalid request" });
    }

    // Create room set if it doesn't exist
    if (!voiceRooms.has(roomCode)) {
      voiceRooms.set(roomCode, new Set());
    }

    const set = voiceRooms.get(roomCode);

    // Check if already in voice
    for (const u of set) {
      if (u.socketId === socket.id) {
        return callback?.({
          success: true,
          voiceUsers: getVoiceUsers(roomCode),
        });
      }
    }

    const voiceUser = {
      socketId: socket.id,
      userId: socket.user.id,
      name: socket.user.name,
      avatarUrl: socket.user.avatarUrl,
    };

    set.add(voiceUser);

    // Notify everyone else in the room that this user joined voice
    socket.to(roomCode).emit("voice:user-joined", {
      voiceUser,
      voiceUsers: getVoiceUsers(roomCode),
    });

    console.log(
      `[Voice] ${socket.user.name} joined voice in room ${roomCode} (${set.size} in voice)`,
    );

    callback?.({
      success: true,
      voiceUsers: getVoiceUsers(roomCode),
    });
  });

  // ─── RELAY SDP OFFER ──────────────────────────────────────
  socket.on("voice:offer", ({ targetSocketId, offer }) => {
    console.log(
      `[Voice] Relaying offer from ${socket.id} to ${targetSocketId}`,
    );
    io.to(targetSocketId).emit("voice:offer", {
      fromSocketId: socket.id,
      fromUserId: socket.user.id,
      fromName: socket.user.name,
      offer,
    });
  });

  // ─── RELAY SDP ANSWER ─────────────────────────────────────
  socket.on("voice:answer", ({ targetSocketId, answer }) => {
    console.log(
      `[Voice] Relaying answer from ${socket.id} to ${targetSocketId}`,
    );
    io.to(targetSocketId).emit("voice:answer", {
      fromSocketId: socket.id,
      answer,
    });
  });

  // ─── RELAY ICE CANDIDATE ──────────────────────────────────
  socket.on("voice:ice-candidate", ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit("voice:ice-candidate", {
      fromSocketId: socket.id,
      candidate,
    });
  });

  // ─── RELAY SPEAKING STATE ──────────────────────────────────
  socket.on("voice:speaking", ({ roomCode, speaking }) => {
    socket.to(roomCode).emit("voice:speaking", {
      userId: socket.user.id,
      speaking,
    });
  });

  // ─── LEAVE VOICE CHANNEL ─────────────────────────────────
  socket.on("voice:leave", ({ roomCode }) => {
    const removed = removeVoiceUser(roomCode, socket.id);
    if (removed) {
      socket.to(roomCode).emit("voice:user-left", {
        socketId: socket.id,
        userId: removed.userId,
        voiceUsers: getVoiceUsers(roomCode),
      });
      console.log(`[Voice] ${socket.user.name} left voice in room ${roomCode}`);
    }
  });

  // ─── CLEANUP ON DISCONNECT ────────────────────────────────
  socket.on("disconnect", () => {
    // Remove from all voice rooms
    for (const [roomCode, set] of voiceRooms) {
      const removed = removeVoiceUser(roomCode, socket.id);
      if (removed) {
        io.to(roomCode).emit("voice:user-left", {
          socketId: socket.id,
          userId: removed.userId,
          voiceUsers: getVoiceUsers(roomCode),
        });
      }
    }
  });
}
