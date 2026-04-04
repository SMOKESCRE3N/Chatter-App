// import { useState } from "react";
// import { useChatStore } from "../store/useChatstore";

// const MessageInput = () => {
//   const [text, setText] = useState("");
//   const { sendMessage } = useChatStore();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;
//     await sendMessage(text);
//     setText("");
//   };

//   return (
//     <div className="px-4 py-4 border-t border-gray-800 bg-gray-900">
//       <form onSubmit={handleSubmit} className="flex items-center gap-3">
//         <input
//           type="text"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Type a message..."
//           className="flex-1 bg-gray-800 text-white rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600 text-sm"
//         />
//         <button
//           type="submit"
//           disabled={!text.trim()}
//           className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-full text-sm font-medium transition disabled:opacity-40"
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// };

// export default MessageInput;

import { useState, useRef } from "react";
import { useChatStore } from "../store/useChatstore";
import { useSocket } from "../context/socketContext";

const MessageInput = () => {
  const [text, setText] = useState("");
  const { sendMessage, selectedUser } = useChatStore();
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);

  const handleTyping = (e) => {
    setText(e.target.value);

    // Emit typing event
    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });

      // Stop typing after 1.5s of no input
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }, 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Stop typing indicator on send
    if (socket && selectedUser) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }

    await sendMessage(text);
    setText("");
  };

  return (
    <div className="px-4 py-4 border-t border-gray-800 bg-gray-900">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
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