"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFeedback, getMyFeedback } from "@/features/feedback/api";
import { useQueryContext } from "@/features/auth/query-context";
import { queryKeys } from "@/lib/api/query-keys";
import type { UserRole } from "@/features/auth/types";
import type { Feedback } from "@/features/feedback/contracts";
import type { z } from "zod";
import { createFeedbackInputSchema } from "@/features/feedback/contracts";

export function useMyFeedback(role: UserRole) {
  const context = useQueryContext(role);
  return useQuery({ queryKey: queryKeys.feedback.mine(context.userId), queryFn: ({ signal }) => getMyFeedback(signal), enabled: context.enabled });
}
export function useCreateFeedback(role: UserRole) {
  const context = useQueryContext(role);
  const client = useQueryClient();
  return useMutation<Feedback, Error, z.output<typeof createFeedbackInputSchema>>({ mutationFn: (input) => createFeedback(input), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.feedback.mine(context.userId), exact: true }) });
}
