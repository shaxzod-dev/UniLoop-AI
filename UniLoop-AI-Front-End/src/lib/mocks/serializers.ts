import type { Assessment } from "@/types/assessment";
import type { CourseDetail, CourseSummary } from "@/types/course";
import type { UserRole } from "@/features/auth/types";

export function courseSummaryDto(course: CourseSummary) {
  return {
    id: course.id,
    title: course.title,
    code: course.code,
    professorId: course.professorId,
    studentCount: course.studentCount,
    outcomeCount: course.outcomeCount,
  };
}
export function courseDetailDto(
  course: CourseDetail,
  role: UserRole,
  studentId: string,
  submissions: readonly { assessmentId: string; studentId: string }[] = [],
) {
  return {
    ...courseSummaryDto(course),
    description: course.description,
    professor: course.professor,
    students:
      role === "PROFESSOR"
        ? course.students
        : course.students.filter((item) => item.id === studentId),
    enrollments:
      role === "PROFESSOR"
        ? course.enrollments
        : course.enrollments.filter((item) => item.studentId === studentId),
    outcomes: course.outcomes,
    materials: course.materials,
    assessments: course.assessments.map((assessment) => ({
      ...assessment,
      submissionCount: submissions.filter(
        (submission) =>
          submission.assessmentId === assessment.id &&
          (role === "PROFESSOR" || submission.studentId === studentId),
      ).length,
    })),
    latestFeedback: course.latestFeedback,
  };
}
export function assessmentDto(assessment: Assessment) {
  return {
    id: assessment.id,
    courseId: assessment.courseId,
    type: assessment.type,
    title: assessment.title,
    estimatedMinutes: assessment.estimatedMinutes,
    questions: assessment.questions.map((question) => ({
      id: question.id,
      outcomeId: question.outcomeId,
      type: question.type,
      prompt: question.prompt,
      options: question.options.map(({ id, text }) => ({ id, text })),
    })),
  };
}
