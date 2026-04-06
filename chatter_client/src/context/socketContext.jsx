// import { createContext, useContext, useEffect, useRef } from "react";
// import { io } from "socket.io-client";
// import { useAuthStore } from "../store/useAuthstore";
// import { useChatStore } from "../store/useChatstore";

// const SocketContext = createContext(null);

// export const useSocket = () => useContext(SocketContext);

// export const SocketProvider = ({ children }) => {
//   const socketRef = useRef(null);
//   const { authUser } = useAuthStore();
//   const { receiveMessage, setOnlineUsers } = useChatStore();

//   useEffect(() => {
//     if (!authUser) return;

//     // Connect socket with userId
//     socketRef.current = io("http://localhost:5000", {
//       query: { userId: authUser._id },
//       withCredentials: true,
//     });

//     // Listen for new messages
//     socketRef.current.on("newMessage", (message) => {
//       receiveMessage(message);
//     });

//     // Listen for online users
//     socketRef.current.on("getOnlineUsers", (users) => {
//       setOnlineUsers(users);
//     });

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, [authUser]);

//   return (
//     <SocketContext.Provider value={socketRef.current}>
//       {children}
//     </SocketContext.Provider>
//   );
// };


import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/useAuthstore";
import { useChatStore } from "../store/useChatstore";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { authUser } = useAuthStore();
  const { receiveMessage, setOnlineUsers, setIsTyping, selectedUser } = useChatStore();

  useEffect(() => {
    if (!authUser) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      query: { userId: authUser._id },
      withCredentials: true,
      transports: ["websocket", "polling"] 
    });

    // New message
    socketRef.current.on("newMessage", (message) => {
      receiveMessage(message);
    });

    // Online users
    socketRef.current.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // Typing indicators
    socketRef.current.on("typing", ({ senderId }) => {
      if (selectedUser?._id === senderId) setIsTyping(true);
    });

    socketRef.current.on("stopTyping", ({ senderId }) => {
      if (selectedUser?._id === senderId) setIsTyping(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [authUser, selectedUser]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};