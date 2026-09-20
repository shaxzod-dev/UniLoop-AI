"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryContext } from "@/features/auth/query-context";
import type { UserRole } from "@/features/auth/types";
import { getSurveys } from "@/features/surveys/api";
import { queryKeys } from "@/lib/api/query-keys";
export function useSurveys(role: UserRole) {
  const context = useQueryContext(role);
  return useQuery({
    queryKey: queryKeys.surveys.byRole(role, context.userId),
    queryFn: ({ signal }) => getSurveys(role, signal),
    enabled: context.enabled,
  });
}
