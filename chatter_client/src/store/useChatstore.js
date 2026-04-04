// import { create } from "zustand";
// import axiosInstance from "../lib/axios";

// export const useChatStore = create((set, get) => ({
//   conversations: [],
//   messages: [],
//   users: [],
//   selectedUser: null,
//   onlineUsers: [],

//   getUsers: async () => {
//     try {
//       const res = await axiosInstance.get("/users");
//       set({ users: res.data });
//     } catch (err) {
//       console.error(err);
//     }
//   },

//   getMessages: async (userId) => {
//     try {
//       const res = await axiosInstance.get(`/messages/${userId}`);
//       set({ messages: res.data });
//     } catch (err) {
//       console.error(err);
//     }
//   },

//   sendMessage: async (text) => {
//     const { selectedUser, messages } = get();
//     try {
//       const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, { text });
//       set({ messages: [...messages, res.data] });
//     } catch (err) {
//       console.error(err);
//     }
//   },

//   // Called by socket when new message arrives
//   receiveMessage: (message) => {
//     set((state) => ({ messages: [...state.messages, message] }));
//   },

//   setSelectedUser: (user) => set({ selectedUser: user }),
//   setOnlineUsers: (users) => set({ onlineUsers: users }),
// }));


// import { create } from "zustand";
// import axiosInstance from "../lib/axios";

// export const useChatStore = create((set, get) => ({
//   conversations: [],
//   messages: [],
//   users: [],
//   selectedUser: null,
//   onlineUsers: [],
//   isTyping: false,

//   getUsers: async () => {
//     try {
//       const res = await axiosInstance.get("/users");
//       set({ users: res.data });
//     } catch (err) {
//       console.error(err);
//     }
//   },

//   getMessages: async (userId) => {
//     try {
//       const res = await axiosInstance.get(`/messages/${userId}`);
//       set({ messages: res.data });
//     } catch (err) {
//       console.error(err);
//     }
//   },

//   sendMessage: async (text) => {
//     const { selectedUser, messages } = get();
//     try {
//       const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, { text });
//       set({ messages: [...messages, res.data] });
//     } catch (err) {
//       console.error(err);
//     }
//   },

//   receiveMessage: (message) => {
//     set((state) => ({ messages: [...state.messages, message] }));
//   },

//   setSelectedUser: (user) => set({ selectedUser: user }),
//   setOnlineUsers: (users) => set({ onlineUsers: users }),
//   setIsTyping: (val) => set({ isTyping: val }),
// }));

import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const useChatStore = create((set, get) => ({
  conversations: [],
  messages: [],
  users: [],
  selectedUser: null,
  onlineUsers: [],
  isTyping: false,
  unreadCounts: {}, // { userId: count }

  getUsers: async () => {
    try {
      const res = await axiosInstance.get("/users");
      set({ users: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  getMessages: async (userId) => {
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  sendMessage: async (text) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, { text });
      set({ messages: [...messages, res.data] });
    } catch (err) {
      console.error(err);
    }
  },

  // When a new message arrives via socket
  receiveMessage: (message) => {
    const { selectedUser, unreadCounts } = get();

    // If chat is already open with this sender, just add message
    if (selectedUser?._id === message.senderId) {
      set((state) => ({ messages: [...state.messages, message] }));
    } else {
      // Otherwise increment unread count for that sender
      set({
        unreadCounts: {
          ...unreadCounts,
          [message.senderId]: (unreadCounts[message.senderId] || 0) + 1,
        },
      });
    }
  },

  // Clear unread count when user opens a chat
  clearUnread: (userId) => {
    const { unreadCounts } = get();
    set({
      unreadCounts: { ...unreadCounts, [userId]: 0 },
    });
  },

  setSelectedUser: (user) => {
    get().clearUnread(user?._id);
    set({ selectedUser: user });
  },

  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setIsTyping: (val) => set({ isTyping: val }),
}));