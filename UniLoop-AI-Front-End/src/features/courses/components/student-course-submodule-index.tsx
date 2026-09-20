"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, ListChecks } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourse, useCourses } from "@/features/courses/queries";
import { t } from "@/i18n";
import type { CourseSummary } from "@/types/course";

type StudentCourseSubmoduleIndexProps = {
  view: "assessments" | "learning-plan";
};

function CourseAssessmentCard({ course }: { course: CourseSummary }) {
  const detail = useCourse(course.id, "STUDENT");
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{course.code}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {detail.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : null}
        {detail.isError ? (
          <p className="text-sm text-destructive">{t("apiInvalidResponse")}</p>
        ) : null}
        {detail.data?.assessments.length ? (
          detail.data.assessments.map((assessment) => (
            <Button
              asChild
              className="w-full justify-between"
              key={assessment.id}
              variant="outline"
            >
              <Link href={`/student/assessments/${assessment.id}`}>
                <span>{assessment.title}</span>
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ))
        ) : detail.isSuccess ? (
          <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CourseLearningPlanCard({ course }: { course: CourseSummary }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{course.code}</p>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm leading-6 text-muted-foreground">
          {t("learningPlanIndexDescription")}
        </p>
        <Button asChild className="w-full justify-between" variant="outline">
          <Link href={`/student/learning-plan/${course.id}`}>
            <span>{t("openLearningPlan")}</span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function StudentCourseSubmoduleIndex({
  view,
}: StudentCourseSubmoduleIndexProps) {
  const courses = useCourses("STUDENT");
  const Icon = view === "assessments" ? ClipboardList : ListChecks;
  const title = view === "assessments" ? "navAssessments" : "navLearningPlan";
  const description =
    view === "assessments"
      ? "assessmentsIndexDescription"
      : "learningPlanIndexIntro";

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
    <PageContainer className="space-y-6 py-8 sm:py-10">
      <header>
        <p className="text-sm font-medium text-primary">{t("navMyCourses")}</p>
        <h1 className="mt-1 flex items-center gap-2 font-heading text-3xl font-semibold tracking-tight">
          <Icon aria-hidden="true" className="size-7 text-primary" />
          {t(title)}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t(description)}
        </p>
      </header>
      {courses.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.data.map((course) =>
            view === "assessments" ? (
              <CourseAssessmentCard course={course} key={course.id} />
            ) : (
              <CourseLearningPlanCard course={course} key={course.id} />
            ),
          )}
        </div>
      ) : (
        <EmptyState />
      )}
    </PageContainer>
  );
}
