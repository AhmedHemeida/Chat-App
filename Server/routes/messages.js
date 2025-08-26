// routes/messages.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const router = express.Router();

// Multer setup
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});
const upload = multer({ storage });

// ✅ إرسال رسالة لشخص واحد (text + images)
router.post('/send', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ error: 'receiverId is required' });
    }

    // 1- دور على conversation بينهم
    let conv = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    // 2- لو مش موجود → اعمله
    if (!conv) {
      conv = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }

    // 3- جهز المرفقات
    const attachments = (req.files || []).map(f => `/uploads/${f.filename}`);

    // 4- حدد النوع
    const type =
      attachments.length > 0 && !text ? 'image'
      : attachments.length > 0 && text ? 'text+image'
      : 'text';

    // 5- خزّن الرسالة مع receiver
    const message = await Message.create({
      conversation: conv._id,
      sender: senderId,
      receiver: receiverId,   // ✅ هنا الإضافة
      type,
      text: text || '',
      attachments
    });

    // 6- حدّث الكونفرسيشن
    conv.lastMessage = message._id;
    conv.updatedAt = new Date();
    await conv.save();

    // 7- رجّع الرسالة populated
    const populated = await Message.findById(message._id)
      .populate('sender', 'name email avatarUrl')
      .populate('receiver', 'name email avatarUrl'); // ✅ populate receiver

 
    req.io.emit("new-msg", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
