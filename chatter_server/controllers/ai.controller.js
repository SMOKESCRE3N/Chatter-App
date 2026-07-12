import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const suggestReply = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided" });
    }

    const context = messages
      .map((m) => `${m.senderId}: ${m.text}`)
      .join("\n");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await getAI().models.generateContentStream({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: `You are a helpful chat assistant.
Given the last few messages in a conversation, suggest exactly 3 short reply options.
Format your response EXACTLY like this, nothing else:
1. [reply one]
2. [reply two]
3. [reply three]

Keep each reply under 15 words. Sound natural and conversational.`,
      },
      contents: `Here are the last messages in the conversation:\n\n${context}\n\nSuggest 3 replies.`,
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ token: chunk.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error("suggest-reply error:", error.message);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: "AI service unavailable. Try again later." });
    }
  }
};

export const getSentiment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "No text provided" });
    }

    const response = await getAI().models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: `You are a sentiment analysis engine.
Analyze the sentiment of the given text.
Respond ONLY with a valid JSON object in this exact format:
{"label": "positive" | "neutral" | "negative", "confidence": <number 0-100>}
No explanation. No markdown. Just the JSON object.`,
      },
      contents: text,
    });

    const raw = response.text.trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);
    res.json(result);

  } catch (error) {
    console.error("sentiment error:", error.message);
    res.json({ label: "neutral", confidence: 0 });
  }
};

// ─────────────────────────────────────────
// POST /api/ai/summarize
// Body: { messages: [{senderId, text}] }
// Streams a 3-sentence TL;DR of the conversation
// ─────────────────────────────────────────
export const summarizeChat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages to summarize" });
    }

    const context = messages
      .map((m) => `${m.senderId}: ${m.text}`)
      .join("\n");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await getAI().models.generateContentStream({
      model: "gemini-1.5-flash",
      config: {
        systemInstruction: `You are a chat summarizer.
Summarize the given conversation in exactly 3 sentences.
Be concise and factual. Capture the key topics and outcomes.
Do not use bullet points. Just 3 plain sentences.`,
      },
      contents: `Summarize this conversation:\n\n${context}`,
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ token: chunk.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error("summarize error:", error.message);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: "AI service unavailable. Try again later." });
    }
  }
};