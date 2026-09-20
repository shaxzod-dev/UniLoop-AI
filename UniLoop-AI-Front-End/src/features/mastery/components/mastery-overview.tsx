"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, NotebookTabs } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourse } from "@/features/courses/queries";
import { useMastery } from "@/features/mastery/queries";
import {
  formatMasteryPercentage,
  masteryPresentation,
} from "@/features/mastery/presentation";
import { t } from "@/i18n";

const evidenceTypeLabels = {
  ASSESSMENT: "evidenceAssessment",
  PROJECT: "evidenceProject",
  PROFESSOR_VERIFICATION: "evidenceProfessorVerification",
} as const;

function percentageChange(value: number) {
  return `${value > 0 ? "+" : ""}${value}%`;
}

export function MasteryOverview({ courseId }: { courseId: string }) {
  const course = useCourse(courseId, "STUDENT");
  const mastery = useMastery(courseId);
  if (course.isLoading || mastery.isLoading)
    return (
      <PageContainer className="py-8">
        <LoadingState cards={4} />
      </PageContainer>
    );
  if (course.isError || mastery.isError)
    return (
      <PageContainer className="py-8">
        <ErrorState
          retry={() => {
            void course.refetch();
            void mastery.refetch();
          }}
          title="courseNotFound"
        />
      </PageContainer>
    );
  if (!course.data || !mastery.data || !mastery.data.outcomes.length)
    return (
      <PageContainer className="py-8">
        <EmptyState />
      </PageContainer>
    );
  const outcomes = mastery.data.outcomes
    .map((entry) => ({
      entry,
      outcome: course.data?.outcomes.find(
        (item) => item.id === entry.outcomeId,
      ),
    }))
    .filter((item) => item.outcome);
  return (
    <PageContainer className="py-8 sm:py-10">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("knowledgeMap")}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            {course.data.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("masteryByOutcome")}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/student/learning-plan/${courseId}`}>
            <NotebookTabs aria-hidden="true" />
            {t("openLearningPlan")}
          </Link>
        </Button>
      </header>
      <section
        aria-label={t("accessibilityMasteryChart")}
        className="mb-6 rounded-xl border border-border bg-card p-5"
      >
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">
              {t("masteryByOutcome")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("accessibilityMasteryChart")}
            </p>
          </div>
          <p className="font-heading text-3xl font-semibold">
            {formatMasteryPercentage(mastery.data)}
          </p>
        </div>
        <div className="space-y-5">
          {outcomes.map(({ entry, outcome }) => (
            <div key={entry.outcomeId}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">{outcome?.title}</span>
                <span>
                  {entry.evidence.length ? `${entry.percentage}%` : "—"} ·{" "}
                  {entry.followUpPercentage === null
                    ? t("diagnosticScore")
                    : `${t("change")} ${percentageChange(entry.change)}`}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <Progress
                  aria-label={`${outcome?.title}: ${entry.percentage}%`}
                  value={entry.percentage}
                />
                <span className="text-xs text-muted-foreground">
                  {entry.followUpPercentage === null
                    ? `${t("diagnosticScore")}: ${entry.diagnosticPercentage === null ? "—" : `${entry.diagnosticPercentage}%`}`
                    : `${t("followUpScore")}: ${entry.followUpPercentage}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {outcomes.map(({ entry, outcome }) => (
          <Card key={entry.outcomeId}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{outcome?.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {outcome?.description}
                  </p>
                </div>
                <Badge
                  className={masteryPresentation[entry.level].className}
                  variant="outline"
                >
                  {t(
                    entry.evidence.length
                      ? masteryPresentation[entry.level].label
                      : "masteryNotAssessed",
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>{t("overallMastery")}</span>
                  <strong>{entry.percentage}%</strong>
                </div>
                <Progress className="mt-2" value={entry.percentage} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    {t("diagnosticScore")}
                  </p>
                  <p className="mt-1 font-medium">
                    {entry.diagnosticPercentage === null
                      ? "—"
                      : `${entry.diagnosticPercentage}%`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("followUpScore")}</p>
                  <p className="mt-1 font-medium">
                    {entry.followUpPercentage === null
                      ? "—"
                      : `${entry.followUpPercentage}% (${percentageChange(entry.change)})`}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">{t("evidence")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {entry.evidence
                    .map((item) => t(evidenceTypeLabels[item.type]))
                    .join(", ") || "—"}
                </p>
              </div>
              {entry.misconceptionDescriptions?.length ? (
                <div>
                  <p className="font-medium text-sm">{t("misconception")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.misconceptionDescriptions.join(" ")}
                  </p>
                </div>
              ) : null}
              <div>
                <p className="font-medium text-sm">{t("nextAction")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {entry.nextAction}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
      <div className="mt-6">
        <Button asChild>
          <Link href={`/student/courses/${courseId}`}>
            <BookOpen aria-hidden="true" />
            {t("returnToCourse")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}
