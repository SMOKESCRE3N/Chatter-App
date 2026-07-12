import express from "express";
import { suggestReply, getSentiment, summarizeChat } from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/protectroute.js";

const router = express.Router();

router.post("/suggest-reply",  suggestReply);
router.post("/sentiment",  getSentiment);
router.post("/summarize",  summarizeChat);

export default router;