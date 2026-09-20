import { ProfessorAssessmentList } from "@/features/assessments/components/professor-assessment-list";

export default async function ProfessorCourseAssessmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <ProfessorAssessmentList courseId={courseId} />;
}
