"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryContext } from "@/features/auth/query-context";
import { getClassInsight } from "@/features/class-insights/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useClassInsight(courseId: string) {
  const context = useQueryContext("PROFESSOR");
  return useQuery({
    queryKey: queryKeys.professorInsights.byCourse(context.userId, courseId),
    queryFn: ({ signal }) => getClassInsight(courseId, signal),
    enabled: context.enabled && !!courseId,
  });
}
