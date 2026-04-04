import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId]
      });
    }

    // Create message
    const message = new Message({
      conversationId: conversation._id,
      senderId,
      text
    });

    // Update last message on conversation
    conversation.lastMessage = { text, sender: senderId };

    // Save both together
    await Promise.all([conversation.save(), message.save()]);

    // --- Socket.io: emit to receiver in real time ---
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json(message);

  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all messages in a conversation
export const getMessages = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) return res.status(200).json([]); // no messages yet

    const messages = await Message.find({
      conversationId: conversation._id
    }).sort({ createdAt: 1 }); // oldest first

    // Mark all unseen messages as seen
    await Message.updateMany(
      { conversationId: conversation._id, senderId: receiverId, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json(messages);

  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all conversations for sidebar
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: { $in: [userId] }
    })
    .populate("participants", "-password")  // get user details
    .populate("lastMessage.sender", "fullName")
    .sort({ updatedAt: -1 }); // most recent first

    res.status(200).json(conversations);

  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};