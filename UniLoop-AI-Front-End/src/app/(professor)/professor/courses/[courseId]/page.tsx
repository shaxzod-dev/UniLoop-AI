import { ProfessorCourseDetail } from "@/features/courses/components/professor-course-detail";

export default async function ProfessorCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <ProfessorCourseDetail courseId={courseId} />;
}
