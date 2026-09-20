"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryContext } from "@/features/auth/query-context";
import { getStudentProgress } from "@/features/progress/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useStudentProgress() {
  const context = useQueryContext("STUDENT");
  return useQuery({ queryKey: queryKeys.students.progress(context.userId), queryFn: ({ signal }) => getStudentProgress(signal), enabled: context.enabled });
}
