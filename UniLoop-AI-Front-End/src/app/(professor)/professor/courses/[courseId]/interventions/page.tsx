import { InterventionList } from "@/features/interventions/components/intervention-list";

export default async function ProfessorCourseInterventionsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <InterventionList courseId={courseId} />;
}
