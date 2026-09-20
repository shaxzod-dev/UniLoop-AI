"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useAuthStore, sessionProfileId } from "@/features/auth/store";
import type { UserRole } from "@/features/auth/types";
import { ApiError } from "@/lib/api/errors";
import { invalidateQueryKeys } from "@/lib/api/query-keys";

export function useQueryContext(expectedRole: UserRole) {
  const role = useAuthStore((state) => state.role);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  return {
    userId: user
      ? "profileId" in user
        ? user.profileId
        : user.id
      : "anonymous",
    enabled: hydrated && !!user && role === expectedRole,
  };
}
export function useRoleMutation<TData, TVariables>(
  expectedRole: UserRole,
  mutate: (variables: TVariables) => Promise<TData>,
  affectedKeys: (
    data: TData,
    variables: TVariables,
    userId: string,
  ) => readonly QueryKey[],
) {
  const queryClient = useQueryClient();
  return useMutation<TData, ApiError, TVariables, { userId: string }>({
    onMutate: () => {
      const state = useAuthStore.getState();
      if (!state.hydrated || !state.role)
        throw new ApiError("UNAUTHORIZED", 401, "apiUnauthorized");
      if (state.role !== expectedRole)
        throw new ApiError("FORBIDDEN", 403, "apiForbidden");
      return { userId: sessionProfileId() };
    },
    mutationFn: mutate,
    onSuccess: async (data, variables, context) => {
      if (context)
        await invalidateQueryKeys(
          queryClient,
          affectedKeys(data, variables, context.userId),
        );
    },
  });
}
