"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { ProfessorCourseCard } from "@/features/courses/components/professor-course-card";
import { useCourses } from "@/features/courses/queries";
import { t } from "@/i18n";

export function ProfessorCourseList() {
  const courses = useCourses("PROFESSOR");
  if (courses.isLoading)
    return (
      <PageContainer className="py-8">
        <LoadingState />
      </PageContainer>
    );
  if (courses.isError)
    return (
      <PageContainer className="py-8">
        <ErrorState retry={() => void courses.refetch()} />
      </PageContainer>
    );
  return (
    <PageContainer className="py-8 sm:py-10">
      <header className="mb-7">
        <p className="text-sm font-medium text-primary">
          {t("professorOverview")}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">
          {t("navCourses")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("professorCoursesDescription")}
        </p>
      </header>
      {courses.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.data.map((course) => (
            <ProfessorCourseCard course={course} key={course.id} />
          ))}
        </div>
      ) : null}
    </PageContainer>
  );
}
