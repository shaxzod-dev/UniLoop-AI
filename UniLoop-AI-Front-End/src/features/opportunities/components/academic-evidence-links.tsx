"use client";

import Link from "next/link";
import { ContextState } from "@/components/feedback/context-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { useCourses } from "@/features/courses/queries";
import { t } from "@/i18n";

export function AcademicEvidenceLinks() {
  const courses = useCourses("STUDENT");
  if (courses.isLoading) return <LoadingState cards={1} />;
  if (courses.isError)
    return <ErrorState retry={() => void courses.refetch()} />;
  if (!courses.data?.length)
    return (
      <ContextState
        title="noEvidenceTitle"
        description="noEvidenceDescription"
      />
    );
  return (
    <div className="flex flex-wrap gap-3">
      {courses.data.map((course) => (
        <Link
          className="min-h-11 rounded-lg border border-border bg-card p-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
          href={`/student/mastery/${course.id}`}
          key={course.id}
        >
          {course.title} · {t("openKnowledgeMap")}
        </Link>
      ))}
    </div>
  );
}
