// src/store/useStore.js
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Create the store
const useStore = create(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        login: (credentials) => {
          // Simulate authentication
          if (
            credentials.username === "admin" &&
            credentials.password === "password"
          ) {
            set({
              isAuthenticated: true,
              user: { username: credentials.username },
            });
            return true;
          }
          return false;
        },
        logout: () => set({ isAuthenticated: false, user: null }),
      }),
      {
        name: "app-storage", // unique name for localStorage
        partialize: (state) => ({
          user: state.user,
          auth: state.auth,
          tokens: state.tokens,
        }), // only persist user state
      }
    )
  )
);

export default useStore;
