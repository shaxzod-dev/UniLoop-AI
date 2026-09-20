"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/features/auth/store";
import { getIdentity } from "@/features/auth/api";
import { env } from "@/lib/env";
import { useQueryClient } from "@tanstack/react-query";

export function AuthHydrator() {
  const cache = useQueryClient();
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, previous) => {
      const loggedOut = Boolean(previous.accessToken && !state.accessToken);
      const switchedUser = Boolean(
        previous.user?.id && state.user?.id && previous.user.id !== state.user.id,
      );
      if (loggedOut || switchedUser) {
        cache.clear();
      }
    });
    async function hydrate() {
      await useAuthStore.persist.rehydrate();
      if (env.useMocks) return;
      const token = useAuthStore.getState().accessToken;
      if (token) {
        try {
          const user = await getIdentity();
          if (useAuthStore.getState().accessToken === token)
            useAuthStore.getState().setSession(token, user);
        } catch {
          if (useAuthStore.getState().accessToken === token)
            useAuthStore.getState().logout();
        }
      }
      useAuthStore.getState().setHydrated(true);
    }
    void hydrate().catch(() => {
      useAuthStore.getState().logout();
      useAuthStore.getState().setHydrated(true);
    });
    return unsubscribe;
  }, [cache]);

  return null;
}
