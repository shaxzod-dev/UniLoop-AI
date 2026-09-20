import { z } from "zod";
import {
  courseDetailDtoSchema,
  courseCatalogItemSchema,
  courseSummaryDtoSchema,
  dashboardResponseSchema,
} from "@/features/courses/contracts";
import type {
  AcademicDashboard,
  CourseCatalogItem,
  CourseDetail,
  CourseSummary,
} from "@/types/course";

export function adaptCourseSummary(
  dto: z.output<typeof courseSummaryDtoSchema>,
): CourseSummary {
  return {
    id: dto.id,
    title: dto.title,
    code: dto.code,
    professorId: dto.professorId,
    studentCount: dto.studentCount,
    outcomeCount: dto.outcomeCount,
  };
}
export function adaptCourseCatalogItem(
  dto: z.output<typeof courseCatalogItemSchema>,
): CourseCatalogItem {
  return {
    ...adaptCourseSummary(dto),
    description: dto.description,
    professorName: dto.professorName,
    status: dto.status,
    availableForEnrollment: dto.availableForEnrollment,
    enrollmentStatus: dto.enrollmentStatus,
    enrollmentRequestId: dto.enrollmentRequestId,
    requestedAt: dto.requestedAt,
    decisionNote: dto.decisionNote,
  };
}
export function adaptCourseDetail(
  dto: z.output<typeof courseDetailDtoSchema>,
): CourseDetail {
  return {
    ...adaptCourseSummary(dto),
    description: dto.description,
    professor: dto.professor,
    students: dto.students,
    enrollments: dto.enrollments,
    outcomes: dto.outcomes,
    materials: dto.materials,
    assessments: dto.assessments,
    latestFeedback: dto.latestFeedback,
  };
}
export function adaptDashboard(
  dto: z.output<typeof dashboardResponseSchema>,
): AcademicDashboard {
  return dto.data;
}
