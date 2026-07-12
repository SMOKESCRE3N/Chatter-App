import { useChatStore } from "../store/useChatstore";
import MessageInput from "./Messageinput";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthstore";

const API_BASE = "http://localhost:5000";

const sentimentEmoji = (label) => {
  if (label === "positive") return "😊";
  if (label === "negative") return "😞";
  return "😐";
};

const ChatWindow = () => {
  const { selectedUser, messages, getMessages, onlineUsers, isTyping, setSelectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const bottomRef = useRef(null);

  const [sentimentMap, setSentimentMap] = useState({});

  // Summarizer state
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
    // Clear summary when switching users
    setSummary("");
    setShowSummary(false);
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const fetchSentiments = async () => {
      const toAnalyze = messages
        .filter((m) => m.text && !sentimentMap[m._id])
        .slice(-10);

      for (const msg of toAnalyze) {
        try {
          const res = await fetch(`${API_BASE}/api/ai/sentiment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text: msg.text }),
          });
          const data = await res.json();
          setSentimentMap((prev) => ({ ...prev, [msg._id]: data }));
        } catch {
          // silent fail
        }
      }
    };

    fetchSentiments();
  }, [messages]);

  const handleSummarize = async () => {
    if (!messages || messages.length === 0) return;

    setIsSummarizing(true);
    setSummary("");
    setShowSummary(true);

    const formatted = messages.map((m) => ({
      senderId: m.senderId === authUser._id ? "Me" : selectedUser.fullName,
      text: m.text,
    }));

    try {
      const response = await fetch(`${API_BASE}/api/ai/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: formatted }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              setSummary((prev) => prev + data.token);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (error) {
      console.error("Summarize error:", error);
      setSummary("Could not summarize. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-950">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-white text-xl font-semibold">Welcome to Chatter</h2>
        <p className="text-gray-500 text-sm mt-2">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950">

      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3 bg-gray-900">
        <button
          onClick={() => setSelectedUser(null)}
          className="text-gray-400 hover:text-white transition mr-1"
        >
          ←
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
            {selectedUser.fullName.charAt(0).toUpperCase()}
          </div>
          {onlineUsers.map(id => id.toString()).includes(selectedUser._id.toString()) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-white font-medium">{selectedUser.fullName}</p>
          <p className="text-xs text-gray-500">
            {onlineUsers.map(id => id.toString()).includes(selectedUser._id.toString()) ? "Online" : "Offline"}
          </p>
        </div>

        {/* Summarize Button */}
        <button
          onClick={handleSummarize}
          disabled={isSummarizing || messages.length === 0}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-30 transition"
        >
          {isSummarizing ? "Summarizing..." : "📋 Summarize"}
        </button>
      </div>

      {/* Summary Panel — streams in below header */}
      {showSummary && (
        <div className="mx-4 mt-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 relative">
          <button
            onClick={() => setShowSummary(false)}
            className="absolute top-2 right-3 text-gray-500 hover:text-white text-xs"
          >
            ✕
          </button>
          <p className="text-indigo-400 text-xs font-semibold mb-1">📋 Conversation Summary</p>
          {summary
            ? <p className="leading-relaxed">{summary}</p>
            : <p className="text-gray-500 animate-pulse">Generating summary...</p>
          }
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-600 text-sm mt-8">
            No messages yet. Say hi! 👋
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === authUser._id;
          const sentiment = sentimentMap[msg._id];

          return (
            <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm
                  ${isMe
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-800 text-gray-100 rounded-bl-none"
                  }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${isMe ? "text-indigo-300" : "text-gray-500"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {isMe && (
                    <span className="ml-1">{msg.seen ? "✓✓" : "✓"}</span>
                  )}
                  {sentiment && (
                    <span title={`${sentiment.label} (${sentiment.confidence}%)`}>
                      {sentimentEmoji(sentiment.label)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 px-4 py-2 rounded-2xl rounded-bl-none text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatWindow;