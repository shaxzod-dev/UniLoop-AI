"use client";

import Link from "next/link";
import { ArrowRight, Lightbulb, UsersRound } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessorCourseCard } from "@/features/courses/components/professor-course-card";
import {
  useCourse,
  useCourses,
  useProfessorDashboard,
} from "@/features/courses/queries";
import { useClassInsight } from "@/features/class-insights/queries";
import { useInterventions } from "@/features/interventions/queries";
import { useAuthStore } from "@/features/auth/store";
import { t } from "@/i18n";

export function ProfessorDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const dashboard = useProfessorDashboard();
  const courses = useCourses("PROFESSOR");
  const courseId = dashboard.data?.courseIds[0] ?? courses.data?.[0]?.id ?? "";
  const courseDetail = useCourse(courseId, "PROFESSOR");
  const insight = useClassInsight(courseId);
  const interventions = useInterventions(courseId);
  const loading =
    dashboard.isLoading ||
    courses.isLoading ||
    (Boolean(courseId) &&
      (courseDetail.isLoading || insight.isLoading || interventions.isLoading));
  const error =
    dashboard.isError ||
    courses.isError ||
    courseDetail.isError ||
    insight.isError ||
    interventions.isError;
  if (loading)
    return (
      <PageContainer className="py-8">
        <LoadingState cards={4} />
      </PageContainer>
    );
  if (error)
    return (
      <PageContainer className="py-8">
        <ErrorState
          retry={() => {
            void dashboard.refetch();
            void courses.refetch();
            void courseDetail.refetch();
            void insight.refetch();
            void interventions.refetch();
          }}
        />
      </PageContainer>
    );
  if (!courses.data?.length || !insight.data)
    return (
      <PageContainer className="py-8">
        <EmptyState />
      </PageContainer>
    );
  const attention = [...insight.data.outcomes].sort(
    (a, b) => (a.diagnosticPercentage ?? 101) - (b.diagnosticPercentage ?? 101),
  )[0];
  const outcomeTitle = courseDetail.data?.outcomes.find(
    (item) => item.id === attention?.outcomeId,
  )?.title;
  const pending = interventions.data?.find(
    (item) => item.status === "SUGGESTED",
  );
  const support = insight.data.supportGroups[0];
  const supportNames = support
    ? courseDetail.data?.students
        .filter((student) => support.studentIds.includes(student.id))
        .map((student) => student.fullName)
        .join(", ")
    : null;
  return (
    <PageContainer className="py-8 sm:py-10">
      <header className="mb-7">
        <p className="text-sm font-medium text-primary">
          {t("professorOverview")}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">
          {t("welcome")}, {user?.fullName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("professorWelcomeSummary")}
        </p>
      </header>
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("activeCourses")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">
              {courses.data.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("enrolledStudents")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">
              {insight.data.studentCount}
            </p>
            <UsersRound
              aria-hidden="true"
              className="mt-3 size-5 text-primary"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("pendingInterventions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">
              {interventions.data?.filter((item) => item.status === "SUGGESTED")
                .length ?? 0}
            </p>
          </CardContent>
        </Card>
      </section>
      <section className="mb-6">
        <h2 className="mb-3 font-heading text-xl font-semibold">
          {t("activeCourses")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.data.map((item) => (
            <ProfessorCourseCard course={item} key={item.id} />
          ))}
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("attentionConcepts")}</CardTitle>
          </CardHeader>
          <CardContent>
            {attention ? (
              <>
                <p className="font-medium">
                  {outcomeTitle ?? t("learningOutcomes")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {attention.diagnosticPercentage === null
                    ? "—"
                    : `${attention.diagnosticPercentage}%`}{" "}
                  · {attention.supportStudentIds.length}{" "}
                  {t("affectedStudents").toLocaleLowerCase("uz")}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("diagnosticFollowUp")}:{" "}
                  {attention.followUpPercentage === null
                    ? "—"
                    : `${attention.followUpPercentage}% (${attention.improvement === null ? "—" : `${attention.improvement >= 0 ? "+" : ""}${attention.improvement}%`})`}
                </p>
                <Button asChild className="mt-4" size="sm" variant="outline">
                  <Link href={`/professor/courses/${courseId}/insights`}>
                    {t("openInsights")}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("supportStudents")}</CardTitle>
          </CardHeader>
          <CardContent>
            {support ? (
              <>
                <p className="font-medium">
                  {support.studentIds.length}{" "}
                  {t("affectedStudents").toLocaleLowerCase("uz")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {support.reason}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("suggestedSupport")}: {t("taskPractice")}
                </p>
                {supportNames ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {supportNames}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{t("teachingSuggestion")}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("professorApprovalRequired")}
                </p>
              </div>
              <Lightbulb aria-hidden="true" className="size-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {pending ? (
              <>
                <p className="font-medium">{pending.suggestedAction}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {pending.reason}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {pending.affectedStudentCount}{" "}
                  {t("affectedStudents").toLocaleLowerCase("uz")}
                </p>
                <Button asChild className="mt-4" size="sm">
                  <Link href={`/professor/courses/${courseId}/interventions`}>
                    {t("openInterventions")}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
            )}
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}
