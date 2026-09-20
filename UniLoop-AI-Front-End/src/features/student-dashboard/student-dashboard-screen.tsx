"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Map,
} from "lucide-react";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/features/auth/store";
import {
  useCourse,
  useCourses,
  useStudentDashboard,
} from "@/features/courses/queries";
import { useLearningPlan } from "@/features/learning-plans/queries";
import {
  taskStatusLabels,
  taskTypeLabels,
} from "@/features/learning-plans/presentation";
import { useMastery } from "@/features/mastery/queries";
import {
  formatMasteryPercentage,
  masteryPresentation,
} from "@/features/mastery/presentation";
import { useOpportunityDashboard } from "@/features/opportunities/queries";
import { readinessPresentation } from "@/features/opportunities/presentation";
import { t } from "@/i18n";

export function StudentDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const dashboard = useStudentDashboard();
  const courses = useCourses("STUDENT");
  const courseId = dashboard.data?.courseIds[0] ?? courses.data?.[0]?.id ?? "";
  const courseDetail = useCourse(courseId, "STUDENT");
  const mastery = useMastery(courseId);
  const plan = useLearningPlan(courseId);
  const opportunities = useOpportunityDashboard();
  const isLoading =
    dashboard.isLoading ||
    courses.isLoading ||
    (Boolean(courseId) &&
      (mastery.isLoading || plan.isLoading || courseDetail.isLoading));
  const hasError =
    dashboard.isError ||
    courses.isError ||
    mastery.isError ||
    plan.isError ||
    courseDetail.isError;
  if (isLoading)
    return (
      <PageContainer className="py-8">
        <LoadingState cards={4} />
      </PageContainer>
    );
  if (hasError)
    return (
      <PageContainer className="py-8">
        <ErrorState
          retry={() => {
            void dashboard.refetch();
            void courses.refetch();
            void courseDetail.refetch();
            void mastery.refetch();
            void plan.refetch();
          }}
        />
      </PageContainer>
    );
  const course = courses.data?.[0];
  const readiness = opportunities.data?.profile.readinessStage;
  const gap = opportunities.data?.gaps[0];
  if (!course || !courseId)
    return (
      <PageContainer className="py-8 sm:py-10">
        <header className="mb-7">
          <p className="text-sm font-medium text-primary">
            {t("academicOverview")}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            {t("welcome")}, {user?.fullName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("studentDashboardDescription")}
          </p>
        </header>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>{t("noCoursesTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {t("noCoursesDescription")}
              </p>
              <Button asChild className="mt-5" size="sm" variant="outline">
                <Link href="/student/courses">{t("navCourses")}</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>{t("profileReady")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {gap?.reason ?? t("profileReadyDescription")}
              </p>
              {readiness ? (
                <Badge className="mt-4" variant="secondary">
                  {t(readinessPresentation[readiness].label)}
                </Badge>
              ) : null}
              <Button asChild className="mt-5" size="sm">
                <Link href="/student/opportunities">
                  <BriefcaseBusiness aria-hidden="true" />
                  {t("viewCareerOpportunities")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  const nextTasks = [...(plan.data?.tasks ?? [])]
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
  const lowest = mastery.data?.outcomes.length
    ? mastery.data.outcomes.reduce((current, item) =>
        item.percentage < current.percentage ? item : current,
      )
    : undefined;
  const recentAssessment = courseDetail.data?.assessments.find(
    (item) => item.type === "DIAGNOSTIC",
  );
  return (
    <PageContainer className="py-8 sm:py-10">
      <header className="mb-7">
        <p className="text-sm font-medium text-primary">
          {t("academicOverview")}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          {t("welcome")}, {user?.fullName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("studentDashboardDescription")}
        </p>
      </header>
      <section className="mb-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("activeCourse")}
                </p>
                <CardTitle className="mt-1 text-xl">{course.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.code}
                </p>
              </div>
              <BookOpen aria-hidden="true" className="size-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("overallMastery")}
                </p>
                <p className="mt-1 font-heading text-2xl font-semibold">
                  {formatMasteryPercentage(mastery.data)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("completedAssessments")}
                </p>
                <p className="mt-1 font-heading text-2xl font-semibold">
                  {courseDetail.data?.assessments.reduce(
                    (count, item) => count + (item.submissionCount ?? 0),
                    0,
                  ) ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("courseProgress")}
                </p>
                <p className="mt-1 font-heading text-2xl font-semibold">
                  {plan.data?.tasks.filter(
                    (item) => item.status === "COMPLETED",
                  ).length ?? 0}
                  /{plan.data?.tasks.length ?? 0}
                </p>
              </div>
            </div>
            <Progress
              className="mt-5"
              value={mastery.data?.overallPercentage ?? 0}
            />
            <Button asChild className="mt-5" size="sm" variant="outline">
              <Link href={`/student/courses/${courseId}`}>
                {t("openCourse")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <p className="text-sm text-primary-foreground/80">
              {t("nextBestAction")}
            </p>
            <CardTitle className="text-primary-foreground">
              {dashboard.data?.nextAction?.label ?? t("openLearningPlan")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-primary-foreground/85">
              {lowest?.nextAction ?? dashboard.data?.feedback}
            </p>
            <p className="mt-3 text-xs text-primary-foreground/80">
              {nextTasks[0]
                ? `${nextTasks[0].estimatedMinutes} ${t("estimatedMinutes").toLocaleLowerCase("uz")}`
                : ""}
            </p>
            <Button
              asChild
              className="mt-4 bg-background text-foreground hover:bg-background/90"
              size="sm"
            >
              <Link
                href={
                  dashboard.data?.nextAction?.href ??
                  `/student/learning-plan/${courseId}`
                }
              >
                {t("actionContinue")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("overallMastery")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">
              {formatMasteryPercentage(mastery.data)}
            </p>
            {lowest ? (
              <>
                <Badge
                  className={`mt-3 ${masteryPresentation[lowest.level].className}`}
                  variant="outline"
                >
                  {t(masteryPresentation[lowest.level].label)}
                </Badge>
                <p className="mt-3 text-sm text-muted-foreground">
                  {lowest.nextAction}
                </p>
              </>
            ) : null}
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link href={`/student/mastery/${courseId}`}>
                <Map aria-hidden="true" />
                {t("openKnowledgeMap")}
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("openAssessment")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {recentAssessment
                ? t(
                    recentAssessment.type === "DIAGNOSTIC"
                      ? "diagnostic"
                      : "followUp",
                  )
                : "—"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{course.title}</p>
            <p className="mt-3 text-sm">
              {t("overallMastery")}: {formatMasteryPercentage(mastery.data)}
            </p>
            {recentAssessment ? (
              <Button asChild className="mt-4" size="sm" variant="outline">
                <Link href={`/student/assessments/${recentAssessment.id}`}>
                  <CheckCircle2 aria-hidden="true" />
                  {t("openAssessment")}
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("careerPreview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {readiness ? t(readinessPresentation[readiness].label) : "—"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {gap?.reason ?? t("emptyState")}
            </p>
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link href="/student/opportunities">
                <BriefcaseBusiness aria-hidden="true" />
                {t("navOpportunities")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold">
            {t("currentPlan")}
          </h2>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/student/learning-plan/${courseId}`}>
              {t("openLearningPlan")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {nextTasks.map((task) => (
            <Card key={task.id} size="sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">{task.order}</Badge>
                  <Badge variant="secondary">
                    {t(taskStatusLabels[task.status])}
                  </Badge>
                </div>
                <CardTitle className="mt-2">{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {t(taskTypeLabels[task.type])} · {task.estimatedMinutes}{" "}
                  {t("estimatedMinutes").toLocaleLowerCase("uz")}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {task.reason}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
