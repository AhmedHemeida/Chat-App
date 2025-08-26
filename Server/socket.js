// socket.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;
// Map userId -> Set of socketIds
const userSocketMap = new Map();

function getUserSocketMap() {
  return userSocketMap;
}
function getIo() {
  return io;
}

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
    pingTimeout: 60000
  });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    // Client should authenticate by sending token after connection:
    // socket.emit('auth', { token })
    socket.on('auth', (data) => {
      try {
        if (!data || !data.token) return;
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
        const userId = decoded.id.toString();
        // Add mapping
        const set = userSocketMap.get(userId) || new Set();
        set.add(socket.id);
        userSocketMap.set(userId, set);

        // join rooms for any conversations? client can also join rooms on demand
        // optionally send ack
        socket.emit('auth:ok', { userId });
      } catch (err) {
        console.warn('socket auth failed', err.message);
        socket.emit('auth:error', { message: 'Invalid token' });
      }
    });

    // Join conversation room
    // { conversationId }
    socket.on('room:join', ({ conversationId }) => {
      if (!conversationId) return;
      socket.join(conversationId);
    });

    // Leave room
    socket.on('room:leave', ({ conversationId }) => {
      if (!conversationId) return;
      socket.leave(conversationId);
    });

    // client-side message sending (optimistic) - server still persists via REST endpoint recommended
    // But we provide a simple handler that can persist if you want
    socket.on('message:send', async (payload) => {
      // payload: { token, conversationId, text }
      // This handler is optional if you prefer REST-only send
      try {
        if (!payload || !payload.token) return;
        const decoded = jwt.verify(payload.token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const Conversation = require('./models/Conversation');
        const Message = require('./models/Message');

        const conv = await Conversation.findById(payload.conversationId);
        if (!conv) return socket.emit('error', { message: 'Conversation not found' });
        if (!conv.participants.some(p => p.equals(userId))) return socket.emit('error', { message: 'Not part of conversation' });

        const message = await Message.create({
          conversation: conv._id,
          sender: userId,
          type: 'text',
          text: payload.text || ''
        });

        conv.lastMessage = message._id;
        conv.updatedAt = new Date();
        await conv.save();

        const populated = await Message.findById(message._id).populate('sender', 'name email avatarUrl');

        // emit to room
        io.to(conv._id.toString()).emit('message:new', populated);

      } catch (err) {
        console.error('message:send error', err);
      }
    });

    socket.on('disconnect', () => {
      // cleanup socket id from userSocketMap
      for (const [userId, set] of userSocketMap.entries()) {
        if (set.has(socket.id)) {
          set.delete(socket.id);
          if (set.size === 0) userSocketMap.delete(userId);
          else userSocketMap.set(userId, set);
        }
      }
      console.log('socket disconnected', socket.id);
    });
  });

  console.log('Socket.io initialized');
}

module.exports = { initSocket, getIo, getUserSocketMap };
