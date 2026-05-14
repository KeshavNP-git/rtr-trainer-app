// ── WebRTC Signaling Server ────────────────────────────────────
// Handles peer-to-peer signaling for full-duplex audio (phone-call style)
// Both users can speak and listen simultaneously — no PTT restriction

const rooms = new Map(); // { roomId: { users: Map<socketId, userData> } }

function initializeRadioComm(io) {
  io.on('connection', (socket) => {
    console.log(`[RADIO] Socket connected: ${socket.id}`);

    // ── Join Room ─────────────────────────────────────────────
    socket.on('join-room', ({ roomId, displayName, role }) => {
      // Leave any existing room first
      const existingRoomId = socket.currentRoomId;
      if (existingRoomId && rooms.has(existingRoomId)) {
        leaveRoom(socket, io);
      }

      // Create room if needed
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { users: new Map() });
      }

      const room = rooms.get(roomId);

      // Max 2 users per room
      if (room.users.size >= 2) {
        socket.emit('room-full', { message: 'Room is full (max 2 users)' });
        return;
      }

      // Add user to room
      room.users.set(socket.id, { displayName, role, socketId: socket.id });
      socket.join(roomId);
      socket.currentRoomId = roomId;

      console.log(`[RADIO] ${displayName} (${role}) joined room ${roomId} — ${room.users.size}/2`);

      // Tell this user they joined successfully + who's already in the room
      const others = [...room.users.values()].filter(u => u.socketId !== socket.id);
      socket.emit('room-joined', {
        roomId,
        yourSocketId: socket.id,
        displayName,
        role,
        peers: others,
        userCount: room.users.size,
      });

      // Tell everyone else about this new user
      socket.to(roomId).emit('peer-joined', {
        socketId: socket.id,
        displayName,
        role,
        userCount: room.users.size,
      });

      // Broadcast updated user list
      io.to(roomId).emit('room-users', {
        users: [...room.users.values()],
        count: room.users.size,
      });
    });

    // ── WebRTC Signaling ──────────────────────────────────────
    // Relay offer to specific peer
    socket.on('webrtc-offer', ({ targetSocketId, offer, fromDisplayName }) => {
      io.to(targetSocketId).emit('webrtc-offer', {
        offer,
        fromSocketId: socket.id,
        fromDisplayName,
      });
    });

    // Relay answer
    socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('webrtc-answer', {
        answer,
        fromSocketId: socket.id,
      });
    });

    // Relay ICE candidates
    socket.on('webrtc-ice', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('webrtc-ice', {
        candidate,
        fromSocketId: socket.id,
      });
    });

    // ── PTT (Push-To-Talk) Status ────────────────────────────
    socket.on('ptt-start', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const user = room.users.get(socket.id);
      if (!user) return;

      // Broadcast PTT start to peer
      io.to(roomId).except(socket.id).emit('ptt-start', {
        socketId: socket.id,
        displayName: user.displayName,
        role: user.role,
      });
    });

    socket.on('ptt-stop', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      // Broadcast PTT stop to peer
      io.to(roomId).except(socket.id).emit('ptt-stop', {
        socketId: socket.id,
      });
    });


    // ── Disconnect ────────────────────────────────────────────
    socket.on('disconnect', () => {
      leaveRoom(socket, io);
      console.log(`[RADIO] Socket disconnected: ${socket.id}`);
    });

    socket.on('leave-room', () => {
      leaveRoom(socket, io);
    });
  });

  function leaveRoom(socket, io) {
    const roomId = socket.currentRoomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    const user = room.users.get(socket.id);

    room.users.delete(socket.id);
    socket.leave(roomId);
    socket.currentRoomId = null;

    if (user) {
      io.to(roomId).emit('peer-left', {
        socketId: socket.id,
        displayName: user.displayName,
        role: user.role,
        userCount: room.users.size,
      });

      io.to(roomId).emit('room-users', {
        users: [...room.users.values()],
        count: room.users.size,
      });

      console.log(`[RADIO] ${user.displayName} left room ${roomId} — ${room.users.size}/2`);
    }

    // Clean up empty rooms
    if (room.users.size === 0) {
      rooms.delete(roomId);
      console.log(`[RADIO] Room ${roomId} deleted (empty)`);
    }
  }
}

module.exports = { initializeRadioComm };
