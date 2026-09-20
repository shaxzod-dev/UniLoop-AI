import { ClassInsightsScreen } from "@/features/class-insights/components/class-insights-screen";

export default async function ProfessorCourseInsightsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <ClassInsightsScreen courseId={courseId} />;
}
