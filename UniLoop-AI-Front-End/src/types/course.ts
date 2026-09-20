import type { ProfessorSummary, StudentSummary } from "@/types/user";
import type { AssessmentType } from "@/types/assessment";

export interface LearningOutcome {
  id: string;
  courseId: string;
  title: string;
  description: string;
}
export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  content: string;
  uploadedAt: string;
}
export interface Enrollment {
  studentId: string;
  courseId: string;
  enrolledAt: string;
}
export interface AssessmentSummary {
  id: string;
  courseId: string;
  title: string;
  type: AssessmentType;
  questionCount: number;
  submissionCount?: number;
}
export interface CourseSummary {
  id: string;
  title: string;
  code: string;
  professorId: string;
  studentCount: number;
  outcomeCount: number;
}
export type EnrollmentStatus =
  | "AVAILABLE"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ENROLLED";
export interface CourseCatalogItem extends CourseSummary {
  description: string;
  professorName: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  availableForEnrollment: boolean;
  enrollmentStatus: EnrollmentStatus;
  enrollmentRequestId: string | null;
  requestedAt: string | null;
  decisionNote: string | null;
}
export interface EnrollmentRequest {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  university: string | null;
  faculty: string | null;
  major: string | null;
  studyYear: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  decidedAt: string | null;
  decisionNote: string | null;
  courseFit: {
    matchPercentage: number;
    recommended: boolean;
    prerequisitesMet: boolean;
    unmetPrerequisites: string[];
    factors: string[];
    profileSummary: { targetRole: string | null; interests: string[]; coreSkills: string[]; verifiedSkills: string[] };
    assistantSummary: string;
    scoreMethod: string;
  };
}
export interface CourseDetail extends CourseSummary {
  description: string;
  professor: ProfessorSummary;
  students: StudentSummary[];
  enrollments: Enrollment[];
  outcomes: LearningOutcome[];
  materials: CourseMaterial[];
  assessments: AssessmentSummary[];
  latestFeedback: string | null;
}
export interface AcademicDashboard {
  userId: string;
  courseIds: string[];
  nextAction: { label: string; href: string } | null;
  feedback: string | null;
}
