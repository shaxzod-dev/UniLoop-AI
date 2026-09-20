import { validateScenarios } from "@/lib/validation/scenarios";
import { validateGoldenDemo } from "@/lib/validation/golden-demo";
import { validateQueryInvalidation } from "@/lib/validation/query-cache";
import { validateHttpTransport } from "@/lib/validation/http-transport";
import { validateOpportunityWorkflows } from "@/lib/validation/opportunity-workflows";
import { validateV1Contracts } from "@/lib/validation/v1-contracts";

export async function validateApiWorkflows(): Promise<void> {
  await validateScenarios();
  await validateGoldenDemo();
  await validateQueryInvalidation();
  await validateHttpTransport();
  await validateOpportunityWorkflows();
  await validateV1Contracts();
}
