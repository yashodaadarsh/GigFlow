require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const { Op } = require('sequelize');

const sequelize = require('./config/database');
const ChatRoom = require('./models/ChatRoom');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8083';

// ---- In-memory stores ----
const connectedUsers = new Map();    // userId -> socketId
const pendingOffers = new Map();     // targetUserId -> offer payload (buffered until they join)

async function pushNotification(userId, message, type = 'INFO', relatedId = null) {
  try {
    await axios.post(`${NOTIFICATION_URL}/api/notifications/notify`, { 
      userId, 
      message, 
      type, 
      relatedId: String(relatedId) 
    });
  } catch (err) {
    console.warn('[Notification unreachable]', err.message);
  }
}

// ------------- REST ROUTES ------------- //

app.get('/api/health', (req, res) => res.json({ status: 'Communication Service running' }));

// Get or create room. When HIRER creates room (isNew), notify BIDDER
app.post('/api/chat/rooms', async (req, res) => {
  const { gig_id, hirer_id, bidder_id, hirer_name } = req.body;
  try {
    let room = await ChatRoom.findOne({
      where: { gig_id: String(gig_id), bidder_id: String(bidder_id), hirer_id: String(hirer_id) }
    });
    const isNew = !room;
    if (!room) {
      room = await ChatRoom.create({
        gig_id: String(gig_id),
        hirer_id: String(hirer_id),
        bidder_id: String(bidder_id),
      });
    }
      if (isNew) {
        await pushNotification(bidder_id, `${hirer_name || 'A Hirer'} wants to chat with you!`, 'CHAT', hirer_id);
      }
    res.status(200).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to access room' });
  }
});

// Get all rooms for a user
app.get('/api/chat/rooms/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const rooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [{ hirer_id: String(userId) }, { bidder_id: String(userId) }]
      }
    });
    res.status(200).json(rooms);
  } catch {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get messages for a room
app.get('/api/chat/rooms/:roomId/messages', async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { room_id: req.params.roomId },
      order: [['createdAt', 'ASC']]
    });
    res.status(200).json(messages);
  } catch {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// REST endpoint to check for a pending video offer (polled by client joining call)
app.get('/api/video/pending-offer/:userId', (req, res) => {
  const offer = pendingOffers.get(String(req.params.userId));
  if (offer) {
    pendingOffers.delete(String(req.params.userId));  // consume it
    res.json({ offer });
  } else {
    res.json({ offer: null });
  }
});

// ------------- SOCKET.IO ------------- //

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on('register-user', (userId) => {
    connectedUsers.set(String(userId), socket.id);
    socket.userId = String(userId);
  });

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
  });

  // Chat message
  socket.on('send-message', async (data) => {
    const { room_id, sender_id, content } = data;
    try {
      const msg = await Message.create({ room_id, sender_id, content });
      const room = await ChatRoom.findByPk(room_id);
      if (room) {
        const isFromHirer = String(sender_id) === String(room.hirer_id);
        const otherId = isFromHirer ? room.bidder_id : room.hirer_id;

        await pushNotification(otherId, `You have a new message!`, 'CHAT', sender_id);
      }
      io.to(room_id).emit('receive-message', msg);
    } catch (err) {
      console.error('Message save failed:', err);
    }
  });

  // WebRTC: offer from caller
  socket.on('video-offer', async (payload) => {
    const targetId = String(payload.target);
    const callerId = String(payload.from || socket.userId || '');

    // Buffer the offer so the callee can retrieve it when they join
    pendingOffers.set(targetId, { ...payload, from: callerId });

    // Try to deliver immediately if target is connected
    const targetSocketId = connectedUsers.get(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('video-offer', { ...payload, from: callerId });
      pendingOffers.delete(targetId); // delivered directly
    }

    // Notify via STOMP regardless (may not be on the video page yet)
    await pushNotification(targetId, `📹 Incoming video call!`, 'VIDEO_CALL', callerId);
  });

  socket.on('video-answer', (payload) => {
    const targetSocketId = connectedUsers.get(String(payload.target));
    if (targetSocketId) io.to(targetSocketId).emit('video-answer', payload);
  });

  socket.on('video-decline', async (payload) => {
    const targetSocketId = connectedUsers.get(String(payload.target));
    if (targetSocketId) io.to(targetSocketId).emit('video-decline', payload);
    await pushNotification(payload.target, `Call Declined`, 'CANCEL_CALL', socket.userId);
  });

  socket.on('video-hangup', async (payload) => {
    const targetSocketId = connectedUsers.get(String(payload.target));
    if (targetSocketId) io.to(targetSocketId).emit('video-hangup', payload);
    await pushNotification(payload.target, `Call Ended`, 'CANCEL_CALL', socket.userId);
  });

  socket.on('new-ice-candidate', (payload) => {
    const targetSocketId = connectedUsers.get(String(payload.target));
    if (targetSocketId) io.to(targetSocketId).emit('new-ice-candidate', payload);
  });

  socket.on('disconnect', () => {
    if (socket.userId) connectedUsers.delete(socket.userId);
  });
});

// ------------- STARTUP ------------- //
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ MySQL synchronized.');
    server.listen(PORT, () => console.log(`🚀 Communication Service on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ DB failed:', err.message);
    server.listen(PORT, () => console.log(`⚠️ Running without DB on port ${PORT}`));
  });
