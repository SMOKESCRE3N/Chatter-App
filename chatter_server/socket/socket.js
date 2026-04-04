// import { Server } from "socket.io";

// export const initSocket = (httpServer) => {
//   const io = new Server(httpServer, {
//     cors: {
//       origin: "http://localhost:5173",
//       credentials: true
//     }
//   });

//   io.on("connection", (socket) => {
//     console.log("🔌 User connected:", socket.id);

//     socket.on("disconnect", () => {
//       console.log("❌ User disconnected:", socket.id);
//     });
//   });
// };

import { Server } from "socket.io";

export let io;

// Maps userId → socketId
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`🟢 User connected: ${userId} → socket: ${socket.id}`);
    }

    // Broadcast online users to everyone
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Typing indicators
    socket.on("typing", ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId: userId });
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${userId}`);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
 };
// ```

// ---

// ## Step 5 — Test the APIs

// Make sure your server is still running (`npm run dev`), then test:

// **Send a message** (login first to get cookie, then):
// ```
// POST http://localhost:5000/api/messages/send/<receiverUserId>
// Body: { "text": "Hey there!" }
// ```

// **Get messages:**
// ```
// GET http://localhost:5000/api/messages/<receiverUserId>
// ```

// **Get all users (sidebar):**
// ```
// GET http://localhost:5000/api/users