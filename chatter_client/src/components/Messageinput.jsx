import { useState, useRef } from "react";
import { useChatStore } from "../store/useChatstore";
import { useAuthStore } from "../store/useAuthstore";
import { useSocket } from "../context/socketContext";

const API_BASE = "http://localhost:5000";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const { sendMessage, selectedUser, messages } = useChatStore();
  const { authUser } = useAuthStore();
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);

  const handleTyping = (e) => {
    setText(e.target.value);
    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }, 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (socket && selectedUser) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
    await sendMessage(text);
    setText("");
    setSuggestions([]); // clear suggestions after sending
  };

  const fetchSuggestions = async () => {
    if (!messages || messages.length === 0) return;

    setLoadingSuggestions(true);
    setSuggestions([]);

    // Format last 5 messages for context
    const lastMessages = messages.slice(-5).map((m) => ({
      senderId: m.senderId === authUser._id ? "Me" : selectedUser.fullName,
      text: m.text,
    }));

    try {
      const response = await fetch(`${API_BASE}/api/ai/suggest-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: lastMessages }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6)); // strip "data: "
            if (data.done) {
              // Parse "1. reply\n2. reply\n3. reply" into array
              const parsed = fullText
                .split("\n")
                .filter((l) => l.match(/^\d\./))
                .map((l) => l.replace(/^\d\.\s*/, "").trim())
                .filter(Boolean);
              setSuggestions(parsed);
            } else if (data.token) {
              fullText += data.token;
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (error) {
      console.error("Suggestions error:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="px-4 py-4 border-t border-gray-800 bg-gray-900">

      {/* AI Reply Suggestions */}
      {loadingSuggestions && (
        <div className="flex gap-2 mb-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-28 bg-gray-700 rounded-full animate-pulse"
            />
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setText(s);
                setSuggestions([]);
              }}
              className="bg-gray-800 hover:bg-indigo-700 text-gray-200 text-xs px-3 py-1.5 rounded-full border border-gray-700 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Row */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">

        {/* Suggest Button */}
        <button
          type="button"
          onClick={fetchSuggestions}
          disabled={loadingSuggestions || !messages?.length}
          className="text-indigo-400 hover:text-indigo-300 text-xs font-medium disabled:opacity-30 transition whitespace-nowrap"
          title="Get AI reply suggestions"
        >
          ✨ Suggest
        </button>

        <input
          type="text"
          value={text}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 text-white rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600 text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-full text-sm font-medium transition disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;