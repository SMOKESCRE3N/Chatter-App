import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { initSocket } from "./socket/socket.js"
import aiRoutes from "./routes/ai.js"; 

import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/messages.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();
const httpServer = createServer(app); // needed for socket.io

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173","https://chatter-app-fa.vercel.app"],// React Vite default port
  credentials: true               // allow cookies
}));

app.get("/", (req, res) => res.send("Chatter API is running ✅"));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);  

// Socket.io
initSocket(httpServer);

// Connect DB + Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    httpServer.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("❌ DB connection error:", err));