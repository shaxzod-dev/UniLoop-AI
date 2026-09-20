import { StudentCourseDetail } from "@/features/courses/components/student-course-detail";

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <StudentCourseDetail courseId={courseId} />;
}
