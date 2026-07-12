import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        set({ user: data, token: data.token });
        return data;
      },

      signup: async (name, email, password) => {
        const { data } = await api.post("/auth/signup", { name, email, password });
        set({ user: data, token: data.token });
        return data;
      },

      logout: () => set({ user: null, token: null }),

      isAuthenticated: () => !!get().token,
    }),
    { name: "assetflow-auth" }
  )
);
