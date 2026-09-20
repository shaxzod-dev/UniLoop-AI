import { z } from "zod";
import { insightResponseSchema } from "@/features/class-insights/contracts";
import type { ClassInsight } from "@/types/class-insight";
export function adaptInsight(
  dto: z.output<typeof insightResponseSchema>,
): ClassInsight {
  return dto.data;
}
