import { StudentAssessment } from "@/features/assessments/components/student-assessment";

export default async function StudentAssessmentPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  return <StudentAssessment assessmentId={assessmentId} />;
}
