import type { MockDatabase } from "@/lib/mocks/database";
import { validateAcademicData } from "@/lib/validation/academic-data";
import { validateCareerData } from "@/lib/validation/career-data";
export { ensure } from "@/lib/validation/assertions";

export function validateMockData(db: MockDatabase): void {
  validateAcademicData(db);
  validateCareerData(db);
}
