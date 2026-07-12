# 💬 Chatter — AI-Enhanced Real-Time Chat App

A full-stack real-time chat application built with the MERN stack, Socket.io, and Google Gemini AI.

🔗 **Live App:** [chatter-app-fa.vercel.app](https://chatter-app-fa.vercel.app)
📦 **Repository:** [github.com/SMOKESCRE3N/Chatter-App](https://github.com/SMOKESCRE3N/Chatter-App)

---

## ✨ AI Features

### 1. 💬 Reply Suggestions
Click the **✨ Suggest** button below the message input to get 3 AI-generated reply options based on the last 5 messages in the conversation. Suggestions stream in token by token and can be clicked to instantly fill the input box.

### 2. 😊 Sentiment Tagging
Every message is automatically analyzed for sentiment and tagged with an emoji:
- 😊 **Positive** — encouraging or happy messages
- 😐 **Neutral** — factual or ambiguous messages
- 😞 **Negative** — frustration or unhappy messages

Hover over the emoji to see the sentiment label and confidence score.

### 3. 📋 Chat Summarizer
Click the **📋 Summarize** button in the chat header to generate a 3-sentence TL;DR of the entire conversation. The summary streams into a dismissible panel below the header, word by word — just like ChatGPT.

---

## 🛠 Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Zustand (state management)
- Socket.io client

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JSON Web Tokens (JWT)
- Google Gemini API (`gemini-1.5-flash`)

---

## 🚀 Features

- 🔐 JWT Authentication (signup, login, logout)
- 💬 Real-time messaging with Socket.io
- ⌨️ Typing indicators
- ✓✓ Message seen/delivered status
- 🟢 Online/offline user status
- 📱 Responsive design
- 🤖 AI reply suggestions (streamed)
- 😊 Per-message sentiment tagging
- 📋 Conversation summarizer (streamed)
- 🛡️ Graceful AI fallback — chat works even if AI is down

---

## ⚙️ Running Locally

### Prerequisites
- Node.js v18+
- MongoDB URI
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Backend Setup
```bash
cd chatter_server
npm install
```

Create `chatter_server/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev
```

### Frontend Setup
```bash
cd chatter_client
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## 🧠 What I Learned

- How LLMs work — tokens, embeddings, context windows
- How to integrate the Google Gemini API into a Node.js backend
- How streaming works using Server-Sent Events (SSE) and `ReadableStream`
- How to parse streamed responses in React token by token
- How to keep API keys secure in a MERN app (server-side only)
- How to write effective system prompts for structured JSON output
- How to build graceful AI fallbacks so the app never breaks

---

## 🔮 Planned Features

- 🌐 Auto-translate messages to receiver's language
- 🔍 Semantic message search using embeddings
- 🤖 Agentic AI assistant inside the chat
