// import express from "express";

// const router = express.Router();

// router.get("/", (req, res) => {
//   res.send("Messages route working");
// });

// export default router;

import express from "express";
import { sendMessage, getMessages, getConversations } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/protectroute.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;