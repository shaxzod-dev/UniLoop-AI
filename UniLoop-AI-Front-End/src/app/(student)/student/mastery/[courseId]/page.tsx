import { MasteryOverview } from "@/features/mastery/components/mastery-overview";

export default async function StudentMasteryPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <MasteryOverview courseId={courseId} />;
}
