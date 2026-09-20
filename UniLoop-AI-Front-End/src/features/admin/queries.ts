"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryContext, useRoleMutation } from "@/features/auth/query-context";
import { decideClub, getAdminOverview } from "@/features/admin/api";
import { queryKeys } from "@/lib/api/query-keys";
import type { ClubDecision } from "@/types/admin";

export function useAdminOverview() {
  const context = useQueryContext("ADMIN");
  return useQuery({
    queryKey: queryKeys.admin.overview(context.userId),
    queryFn: ({ signal }) => getAdminOverview(signal),
    enabled: context.enabled,
  });
}

export function useDecideClub() {
  return useRoleMutation(
    "ADMIN",
    ({ clubId, status }: { clubId: string; status: ClubDecision }) =>
      decideClub(clubId, status),
    (_data, _input, userId) => [queryKeys.admin.overview(userId)],
  );
}