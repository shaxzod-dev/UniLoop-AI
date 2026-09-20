"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryContext } from "@/features/auth/query-context";
import { getMastery } from "@/features/mastery/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useMastery(courseId: string, enabled = true) {
  const context = useQueryContext("STUDENT");
  return useQuery({
    queryKey: queryKeys.mastery.byCourse(context.userId, courseId),
    queryFn: ({ signal }) => getMastery(courseId, signal),
    enabled: context.enabled && !!courseId && enabled,
  });
}
