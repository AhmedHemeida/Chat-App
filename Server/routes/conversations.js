// routes/conversations.js
const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// Create or get one-to-one conversation (participants: logged-in user and otherUserId)
router.post('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.body;
    if (!otherUserId) return res.status(400).json({ error: 'otherUserId required' });
    if (!mongoose.isValidObjectId(otherUserId)) return res.status(400).json({ error: 'invalid otherUserId' });

    // Check if conversation exists (two participants)
    let conv = await Conversation.findOne({
      participants: { $all: [userId, otherUserId], $size: 2 }
    }).populate('participants', 'name email avatarUrl');

    if (!conv) {
      conv = await Conversation.create({ participants: [userId, otherUserId] });
      conv = await Conversation.findById(conv._id).populate('participants', 'name email avatarUrl');
    }

    return res.status(200).json(conv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Inbox: list conversations for current user with last message preview and timestamp
router.get('/inbox', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    // find conversations where user participates
    const convs = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name email avatarUrl')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name _id' }
      });

    // Map to simple inbox items
    const inbox = convs.map(c => {
      // find the other participant
      const other = c.participants.find(p => !p._id.equals(userId));
      return {
        conversationId: c._id,
        otherUser: other ? { id: other._id, name: other.name, email: other.email, avatarUrl: other.avatarUrl } : null,
        lastMessage: c.lastMessage ? {
          id: c.lastMessage._id,
          text: c.lastMessage.type === 'text' ? c.lastMessage.text : '[image]',
          type: c.lastMessage.type,
          sender: c.lastMessage.sender,
          createdAt: c.lastMessage.createdAt
        } : null,
        updatedAt: c.updatedAt,
        createdAt: c.createdAt
      };
    });

    res.json({userId :userId ,  inbox});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get conversation messages (paginated)
router.get('/:convId/messages', auth, async (req, res) => {
  try {
    const { convId } = req.params;
    const { page = 1, limit = 30 } = req.query;
    if (!mongoose.isValidObjectId(convId)) return res.status(400).json({ error: 'invalid convId' });

    const messages = await Message.find({ conversation: convId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'name email avatarUrl');

    // return in chronological order
    res.json(messages.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
