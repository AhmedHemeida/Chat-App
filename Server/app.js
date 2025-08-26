require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const convRoutes = require('./routes/conversations');
const msgRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

// ===== Middlewares =====
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// ===== Socket.io setup =====
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

// اضف io للـ req عشان يكون متاح في أي route
app.use((req, res, next) => {
  req.io = io;
  next();
});

// socket connection
io.on("connection", (socket) => {
  console.log("✅ New client connected");

  socket.on("setup", (userId) => {
    socket.join(userId); // انضمام المستخدم لغرفته الخاصة
    socket.emit("connected");
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

// ===== Routes =====
app.use('/api/auth', authRoutes);
app.use('/api', convRoutes);
app.use('/api/messages', msgRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ===== Start server =====
const PORT = process.env.PORT || 3000;
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
})();
