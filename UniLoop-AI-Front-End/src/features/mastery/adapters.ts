import { z } from "zod";
import { masteryResponseSchema } from "@/features/mastery/contracts";
import type { MasterySummary } from "@/types/mastery";
export function adaptMastery(
  dto: z.output<typeof masteryResponseSchema>,
): MasterySummary {
  return dto.data;
}
