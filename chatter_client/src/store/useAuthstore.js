import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const useAuthStore = create((set) => ({
  authUser: null,
  isLoading: false,
  error: null,

  signup: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || "Signup failed", isLoading: false });
    }
  },

  login: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/auth/login", formData);
      set({ authUser: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || "Login failed", isLoading: false });
    }
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
    set({ authUser: null });
  },

  getMe: async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      set({ authUser: res.data });
    } catch {
      set({ authUser: null });
    }
  }
}));