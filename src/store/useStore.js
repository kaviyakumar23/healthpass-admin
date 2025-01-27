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
        isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
        login: (credentials) => {
          // You should replace these with your actual admin credentials
          // In a real application, these would typically come from an API/backend
          const ADMIN_USERNAME = "admin";
          const ADMIN_PASSWORD = "password";

          const success =
            credentials.username === ADMIN_USERNAME &&
            credentials.password === ADMIN_PASSWORD;

          if (success) {
            localStorage.setItem("isAuthenticated", "true");
            set({
              isAuthenticated: true,
              user: { username: credentials.username },
            });
          }
          return success;
        },
        logout: () => {
          localStorage.removeItem("isAuthenticated");
          set({ isAuthenticated: false, user: null });
        },
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
