// routes/messages.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const router = express.Router();

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

router.post('/send', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ error: 'receiverId is required' });
    }

    let conv = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conv) {
      conv = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }

    const attachments = (req.files || []).map(f => `/uploads/${f.filename}`);

    const type =
      attachments.length > 0 && !text ? 'image'
      : attachments.length > 0 && text ? 'text+image'
      : 'text';

    const message = await Message.create({
      conversation: conv._id,
      sender: senderId,
      receiver: receiverId,   // ✅ هنا الإضافة
      type,
      text: text || '',
      attachments
    });

    conv.lastMessage = message._id;
    conv.updatedAt = new Date();
    await conv.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email avatarUrl')
      .populate('receiver', 'name email avatarUrl'); 

 
    req.io.emit("new-msg", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
