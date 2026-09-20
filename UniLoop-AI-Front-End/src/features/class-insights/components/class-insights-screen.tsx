"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, UsersRound } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClassInsight } from "@/features/class-insights/queries";
import { QuestionDifficultyTable } from "@/features/assessments/components/question-difficulty-table";
import { ProfessorCourseNavigation } from "@/features/courses/components/professor-course-navigation";
import { useCourse } from "@/features/courses/queries";
import { useProfessorAssessment } from "@/features/assessments/queries";
import { t } from "@/i18n";

export function ClassInsightsScreen({ courseId }: { courseId: string }) {
  const course = useCourse(courseId, "PROFESSOR");
  const insight = useClassInsight(courseId);
  const diagnosticId =
    course.data?.assessments.find((item) => item.type === "DIAGNOSTIC")?.id ??
    "";
  const diagnostic = useProfessorAssessment(diagnosticId);
  if (
    course.isLoading ||
    insight.isLoading ||
    (Boolean(diagnosticId) && diagnostic.isLoading)
  )
    return (
      <PageContainer className="py-8">
        <LoadingState cards={5} />
      </PageContainer>
    );
  if (course.isError || insight.isError || diagnostic.isError)
    return (
      <PageContainer className="py-8">
        <ErrorState
          retry={() => {
            void course.refetch();
            void insight.refetch();
            void diagnostic.refetch();
          }}
          title="professorCourseNotFound"
        />
      </PageContainer>
    );
  if (!course.data || !insight.data?.outcomes.length)
    return (
      <PageContainer className="py-8">
        <EmptyState />
      </PageContainer>
    );
  const outcomeNames = new Map(
    course.data.outcomes.map((item) => [item.id, item.title]),
  );
  const students = new Map(
    course.data.students.map((item) => [item.id, item.fullName]),
  );
  const chartData = insight.data.outcomes.map((item) => ({
    name: outcomeNames.get(item.outcomeId) ?? t("learningOutcomes"),
    diagnostic: item.diagnosticPercentage,
    followUp: item.followUpPercentage,
  }));
  return (
    <PageContainer className="py-8 sm:py-10">
      <header className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("groupInsights")}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold">
            {course.data.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {insight.data.explanation}
          </p>
        </div>
        <Button asChild>
          <Link href={`/professor/courses/${courseId}/interventions`}>
            <BarChart3 aria-hidden="true" />
            {t("openInterventions")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </header>
      <ProfessorCourseNavigation courseId={courseId} />
      <section
        aria-label={t("accessibilityCohortChart")}
        className="mb-6 rounded-xl border border-border bg-card p-5"
      >
        <h2 className="font-heading text-lg font-semibold">
          {t("cohortMastery")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("accessibilityCohortChart")}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("pairedImprovementNote")}
        </p>
        <div className="mt-5 h-80 w-full">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis domain={[0, 100]} type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip
                formatter={(value) => [`${value}%`, t("cohortMastery")]}
              />
              <Legend />
              <Bar
                dataKey="diagnostic"
                fill="var(--chart-1)"
                name={t("diagnosticScore")}
                radius={[4, 4, 4, 4]}
              />
              <Bar
                dataKey="followUp"
                fill="var(--chart-3)"
                name={t("followUpScore")}
                radius={[4, 4, 4, 4]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {insight.data.outcomes.map((item) => (
            <Card key={item.outcomeId} size="sm">
              <CardHeader>
                <CardTitle>
                  {outcomeNames.get(item.outcomeId) ?? t("learningOutcomes")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    {t("diagnosticScore")}
                  </p>
                  <p className="mt-1 font-semibold">
                    {item.diagnosticPercentage === null
                      ? "—"
                      : `${item.diagnosticPercentage}%`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("followUpScore")}</p>
                  <p className="mt-1 font-semibold">
                    {item.followUpPercentage === null
                      ? "—"
                      : `${item.followUpPercentage}%${item.improvement === null ? "" : ` (${item.improvement > 0 ? "+" : ""}${item.improvement}%)`}`}
                  </p>
                </div>
                <p className="col-span-2 text-muted-foreground">
                  {item.supportStudentIds.length}{" "}
                  {t("affectedStudents").toLocaleLowerCase("uz")} ·{" "}
                  {item.followUpStudentCount}{" "}
                  {t("followUpParticipants").toLocaleLowerCase("uz")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("misconception")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insight.data.misconceptions.map((item) => (
              <div
                className="border-b border-border pb-4 last:border-0 last:pb-0"
                key={item.misconceptionId}
              >
                <p className="font-medium">
                  {outcomeNames.get(item.outcomeId) ?? t("learningOutcomes")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.studentIds.length}{" "}
                  {t("affectedStudents").toLocaleLowerCase("uz")} ·{" "}
                  {t("insightEvidence")}: {t("diagnostic")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("supportStudents")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insight.data.supportGroups.map((group) => (
              <div
                className="border-b border-border pb-4 last:border-0 last:pb-0"
                key={group.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">
                    {t("supportGroup")}:{" "}
                    {outcomeNames.get(group.outcomeId) ?? t("learningOutcomes")}
                  </p>
                  <UsersRound
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {group.reason}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {group.studentIds
                    .map((id) => students.get(id) ?? t("supportStudents"))
                    .join(", ")}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("suggestedSupport")}: {t("taskPractice")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <section className="mb-6">
        <h2 className="mb-3 font-heading text-xl font-semibold">
          {t("questionDifficulty")}
        </h2>
        <QuestionDifficultyTable
          items={insight.data.questionDifficulty}
          misconceptions={insight.data.misconceptions}
          outcomes={course.data.outcomes}
          questions={diagnostic.data?.questions ?? []}
        />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>{t("insightEvidence")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            {t("evidenceExplanation")}
          </p>
          <p className="mt-3 text-sm">
            {t("linkedOutcomes")}:{" "}
            {course.data.outcomes.map((item) => item.title).join(", ")}
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
