import { LearningPlanView } from "@/features/learning-plans/components/learning-plan-view";

export default async function StudentLearningPlanPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <LearningPlanView courseId={courseId} />;
}
