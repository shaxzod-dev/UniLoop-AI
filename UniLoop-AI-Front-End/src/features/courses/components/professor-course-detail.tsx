"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Lightbulb,
  UsersRound,
} from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useClassInsight } from "@/features/class-insights/queries";
import { ProfessorCourseNavigation } from "@/features/courses/components/professor-course-navigation";
import {
  useCourse,
  useDecideEnrollmentRequest,
  useEnrollmentRequests,
} from "@/features/courses/queries";
import { t } from "@/i18n";

export function ProfessorCourseDetail({ courseId }: { courseId: string }) {
  const course = useCourse(courseId, "PROFESSOR");
  const insight = useClassInsight(courseId);
  const enrollmentRequests = useEnrollmentRequests(courseId);
  const decideEnrollment = useDecideEnrollmentRequest(courseId);
  if (course.isLoading || insight.isLoading || enrollmentRequests.isLoading)
    return (
      <PageContainer className="py-8">
        <LoadingState cards={4} />
      </PageContainer>
    );
  if (course.isError || insight.isError || enrollmentRequests.isError)
    return (
      <PageContainer className="py-8">
        <ErrorState
          retry={() => {
            void course.refetch();
            void insight.refetch();
            void enrollmentRequests.refetch();
          }}
          title="professorCourseNotFound"
        />
      </PageContainer>
    );
  if (!course.data || !insight.data)
    return (
      <PageContainer className="py-8">
        <EmptyState />
      </PageContainer>
    );
  const insightByOutcome = new Map(
    insight.data.outcomes.map((item) => [item.outcomeId, item]),
  );
  const cohort = insight.data.cohortMasteryPercentage;
  const attention = [...insight.data.outcomes].sort(
    (a, b) => (a.diagnosticPercentage ?? 101) - (b.diagnosticPercentage ?? 101),
  )[0];
  const attentionTitle = course.data.outcomes.find(
    (item) => item.id === attention?.outcomeId,
  )?.title;
  const pendingEnrollmentRequests = (enrollmentRequests.data ?? []).filter(
    (request) => request.status === "PENDING",
  );
  return (
    <PageContainer className="py-8 sm:py-10">
      <header className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">{course.data.code}</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold">
            {course.data.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {course.data.description}
          </p>
          <p className="mt-3 text-sm">{course.data.professor.fullName}</p>
        </div>
        <Button asChild>
          <Link href={`/professor/courses/${courseId}/insights`}>
            <BarChart3 aria-hidden="true" />
            {t("openInsights")}
          </Link>
        </Button>
      </header>
      <ProfessorCourseNavigation courseId={courseId} />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("enrolledStudents")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">
              {course.data.studentCount}
            </p>
            <UsersRound
              aria-hidden="true"
              className="mt-3 size-5 text-primary"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("cohortMastery")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">{cohort}%</p>
            <Progress className="mt-4" value={cohort} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("recentImprovement")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">
              {attention?.improvement === null ||
              attention?.improvement === undefined
                ? "—"
                : `+${attention.improvement}%`}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("followUpParticipants")}:{" "}
              {attention?.followUpStudentCount ?? 0}
            </p>
          </CardContent>
        </Card>
      </section>
      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("learningOutcomes")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.data.outcomes.map((outcome) => {
              const item = insightByOutcome.get(outcome.id);
              const value =
                item?.followUpPercentage ?? item?.diagnosticPercentage ?? 0;
              return (
                <div key={outcome.id}>
                  <div className="mb-1 flex justify-between gap-3 text-sm">
                    <span>{outcome.title}</span>
                    <strong>{value}%</strong>
                  </div>
                  <Progress value={value} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item?.improvement !== null &&
                    item?.improvement !== undefined
                      ? `${t("change")}: +${item.improvement}%`
                      : t("diagnosticScore")}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("attentionConcepts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{attentionTitle ?? "—"}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {attention
                ? `${attention.supportStudentIds.length} ${t("affectedStudents").toLocaleLowerCase("uz")}`
                : "—"}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {insight.data.explanation}
            </p>
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link href={`/professor/courses/${courseId}/interventions`}>
                <Lightbulb aria-hidden="true" />
                {t("openInterventions")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold">
            {t("enrollmentRequests")}
          </h2>
          <Badge variant="secondary">{pendingEnrollmentRequests.length}</Badge>
        </div>
        {pendingEnrollmentRequests.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {pendingEnrollmentRequests.map((request) => (
              <Card key={request.id} size="sm">
                <CardHeader>
                  <CardTitle>{request.studentName}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {[request.major, request.faculty, request.university]
                      .filter(Boolean)
                      .join(" · ") || t("applicant")}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <strong>AI moslik tahlili</strong>
                      <Badge variant={request.courseFit.recommended ? "default" : "secondary"}>
                        {request.courseFit.matchPercentage}%
                      </Badge>
                    </div>
                    <p className="mt-2 text-muted-foreground">{request.courseFit.assistantSummary}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Maqsadli yo‘nalish: {request.courseFit.profileSummary.targetRole ?? "ko‘rsatilmagan"}
                    </p>
                    {request.courseFit.unmetPrerequisites.length ? (
                      <p className="mt-1 text-xs text-destructive">Yetishmaydigan prerequisite: {request.courseFit.unmetPrerequisites.join(", ")}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={decideEnrollment.isPending}
                      onClick={() =>
                        decideEnrollment.mutate({
                          requestId: request.id,
                          status: "APPROVED",
                        })
                      }
                      size="sm"
                    >
                      {t("approveEnrollment")}
                    </Button>
                    <Button
                      disabled={decideEnrollment.isPending}
                      onClick={() =>
                        decideEnrollment.mutate({
                          requestId: request.id,
                          status: "REJECTED",
                        })
                      }
                      size="sm"
                      variant="outline"
                    >
                      {t("rejectEnrollment")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card size="sm">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("noEnrollmentRequests")}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
      <section>
        <h2 className="mb-3 font-heading text-xl font-semibold">
          {t("availableAssessments")}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {course.data.assessments.map((assessment) => (
            <Card key={assessment.id} size="sm">
              <CardHeader>
                <CardTitle>{assessment.title}</CardTitle>
                <Badge className="mt-2" variant="outline">
                  {t(
                    assessment.type === "DIAGNOSTIC"
                      ? "diagnostic"
                      : "followUp",
                  )}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {assessment.questionCount} {t("assessmentQuestions")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button asChild className="mt-4" variant="outline">
          <Link href={`/professor/courses/${courseId}/assessments`}>
            <ClipboardList aria-hidden="true" />
            {t("openAssessments")}
          </Link>
        </Button>
      </section>
    </PageContainer>
  );
}
