"use client";

import { PageContainer } from "@/components/shared/page-container";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { MutationFeedback } from "@/components/feedback/mutation-feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentCourseCard } from "@/features/courses/components/student-course-card";
import {
  useCourseCatalog,
  useCourses,
  useRequestEnrollment,
} from "@/features/courses/queries";
import { t } from "@/i18n";
import type { CourseCatalogItem } from "@/types/course";

function CourseCatalogCard({ course }: { course: CourseCatalogItem }) {
  const request = useRequestEnrollment(course.id);
  const pending = course.enrollmentStatus === "PENDING";
  const rejected = course.enrollmentStatus === "REJECTED";
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{course.code}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{course.professorName}</p>
        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
          {course.description || t("studentCoursesDescription")}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          {course.studentCount} {t("enrolledStudents").toLocaleLowerCase("uz")}
        </p>
        {course.decisionNote ? (
          <p className="mt-3 text-xs text-muted-foreground">
            {course.decisionNote}
          </p>
        ) : null}
        {pending ? (
          <Button className="mt-5" disabled size="sm" variant="outline">
            {t("enrollmentRequestPending")}
          </Button>
        ) : (
          <Button
            className="mt-5"
            disabled={request.isPending}
            onClick={() => request.mutate()}
            size="sm"
          >
            {rejected ? t("requestAgain") : t("requestEnrollment")}
          </Button>
        )}
        {rejected ? (
          <p className="mt-2 text-xs text-destructive">
            {t("enrollmentRequestRejected")}
          </p>
        ) : null}
        <MutationFeedback
          error={request.isError}
          pending={request.isPending}
          success={request.isSuccess}
          successMessage="enrollmentRequestSent"
        />
      </CardContent>
    </Card>
  );
}

export function StudentCourseList() {
  const courses = useCourses("STUDENT");
  const catalog = useCourseCatalog();
  if (courses.isLoading || catalog.isLoading)
    return (
      <PageContainer className="py-8">
        <LoadingState />
      </PageContainer>
    );
  if (courses.isError || catalog.isError)
    return (
      <PageContainer className="py-8">
        <ErrorState
          retry={() => {
            void courses.refetch();
            void catalog.refetch();
          }}
        />
      </PageContainer>
    );
  const available = (catalog.data ?? []).filter(
    (course) => course.enrollmentStatus !== "ENROLLED",
  );
  return (
    <PageContainer className="py-8 sm:py-10">
      <header className="mb-7">
        <p className="text-sm font-medium text-primary">
          {t("academicOverview")}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          {t("navCourses")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("studentCoursesDescription")}
        </p>
      </header>
      {courses.data?.length ? (
        <section>
          <h2 className="mb-3 font-heading text-xl font-semibold">
            {t("myCourses")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.data.map((course) => (
              <StudentCourseCard course={course} key={course.id} />
            ))}
          </div>
        </section>
      ) : (
        <Card className="mb-7 max-w-2xl border-primary/20">
          <CardHeader>
            <CardTitle>{t("noCoursesTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {t("availableCoursesDescription")}
            </p>
          </CardContent>
        </Card>
      )}
      <section className={courses.data?.length ? "mt-8" : ""}>
        <h2 className="font-heading text-xl font-semibold">
          {t("availableCourses")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("availableCoursesDescription")}
        </p>
        {available.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {available.map((course) => (
              <CourseCatalogCard course={course} key={course.id} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("emptyState")}
          </p>
        )}
      </section>
    </PageContainer>
  );
}
