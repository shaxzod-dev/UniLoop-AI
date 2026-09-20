"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  AuthUser,
  AuthenticatedUser,
  UserRole,
} from "@/features/auth/types";
import { getDemoUser } from "@/features/auth/demo-users";
import { env } from "@/lib/env";

type AuthState = {
  role: UserRole | null;
  hydrated: boolean;
  user: AuthUser | AuthenticatedUser | null;
  accessToken: string | null;
  setSession: (accessToken: string, user: AuthenticatedUser) => void;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      hydrated: false,
      user: null,
      accessToken: null,
      setSession: (accessToken, user) =>
        set({ accessToken, user, role: user.role, hydrated: true }),
      loginAsRole: (role) => {
        if (env.useMocks)
          set({ role, user: getDemoUser(role), accessToken: null });
      },
      logout: () => set({ role: null, user: null, accessToken: null }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: env.useMocks ? "uniloop-demo-session" : "uniloop-http-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        env.useMocks
          ? { role: state.role }
          : { accessToken: state.accessToken, role: state.role, user: state.user },
      merge: (persisted: unknown, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        if (env.useMocks)
          return {
            ...current,
            role:
              "role" in persisted &&
              (persisted.role === "STUDENT" || persisted.role === "PROFESSOR" || persisted.role === "ADMIN")
                ? persisted.role
                : null,
          };
        const p = persisted as Record<string, unknown>;
        const accessToken =
          typeof p.accessToken === "string" && p.accessToken.length <= 8192
            ? p.accessToken
            : null;
        const role =
          typeof p.role === "string" &&
          (p.role === "STUDENT" || p.role === "PROFESSOR" || p.role === "ADMIN")
            ? p.role
            : null;
        const user = p.user && typeof p.user === "object" ? (p.user as any) : null;
        return {
          ...current,
          accessToken,
          role,
          user,
        };
      },
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (env.useMocks && state.role) {
            state.loginAsRole(state.role);
          }
          if (state.accessToken && state.user && state.role) {
            state.setHydrated(true);
          }
        }
      },
    },
  ),
);
export function sessionProfileId(): string {
  const user = useAuthStore.getState().user;
  return user ? ("profileId" in user ? user.profileId : user.id) : "anonymous";
}
