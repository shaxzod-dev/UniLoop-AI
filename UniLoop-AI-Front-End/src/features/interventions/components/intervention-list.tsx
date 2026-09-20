"use client";

import { useState } from "react";
import { Check, Lightbulb, X } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessorCourseNavigation } from "@/features/courses/components/professor-course-navigation";
import { useCourse } from "@/features/courses/queries";
import {
  useDecideIntervention,
  useInterventions,
} from "@/features/interventions/queries";
import { interventionPresentation } from "@/features/interventions/presentation";
import { t } from "@/i18n";
import type { InterventionDecision } from "@/types/intervention";

export function InterventionList({ courseId }: { courseId: string }) {
  const course = useCourse(courseId, "PROFESSOR");
  const interventions = useInterventions(courseId);
  const decide = useDecideIntervention(courseId);
  const [message, setMessage] = useState<
    "decisionSuccess" | "decisionError" | null
  >(null);
  if (course.isLoading || interventions.isLoading)
    return (
      <PageContainer className="py-8">
        <LoadingState cards={2} />
      </PageContainer>
    );
  if (course.isError || interventions.isError)
    return (
      <PageContainer className="py-8">
        <ErrorState
          retry={() => {
            void course.refetch();
            void interventions.refetch();
          }}
          title="professorCourseNotFound"
        />
      </PageContainer>
    );
  if (!course.data || !interventions.data?.length)
    return (
      <PageContainer className="py-8">
        <EmptyState />
      </PageContainer>
    );
  const outcomes = new Map(
    course.data.outcomes.map((item) => [item.id, item.title]),
  );
  const decideWith = (
    interventionId: string,
    status: InterventionDecision["status"],
  ) => {
    setMessage(null);
    decide.mutate(
      { interventionId, status },
      {
        onSuccess: () => setMessage("decisionSuccess"),
        onError: () => setMessage("decisionError"),
      },
    );
  };
  return (
    <PageContainer className="py-8 sm:py-10">
      <header className="mb-5">
        <p className="text-sm font-medium text-primary">
          {t("teachingRecommendations")}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">
          {course.data.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("professorApprovalRequired")}
        </p>
      </header>
      <ProfessorCourseNavigation courseId={courseId} />
      {message ? (
        <p
          aria-live="polite"
          className={
            message === "decisionSuccess"
              ? "mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
              : "mb-4 rounded-lg bg-destructive/5 p-3 text-sm text-destructive"
          }
        >
          {t(message)}
        </p>
      ) : null}
      <div className="space-y-4">
        {interventions.data.map((intervention) => {
          const presentation = interventionPresentation[intervention.status];
          const pending = decide.isPending;
          return (
            <Card key={intervention.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {t("aiSuggestion")}
                    </p>
                    <CardTitle className="mt-1">
                      {outcomes.get(intervention.outcomeId) ??
                        t("learningOutcomes")}
                    </CardTitle>
                  </div>
                  <Badge className={presentation.className} variant="outline">
                    {t(presentation.label)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 lg:grid-cols-[1fr_1fr_auto]">
                <div>
                  <p className="font-medium text-sm">
                    {t("teachingSuggestion")}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {intervention.suggestedAction}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {t("interventionPurpose")}: {t("taskPractice")}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm">{t("insightEvidence")}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {intervention.reason}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {intervention.affectedStudentCount}{" "}
                    {t("affectedStudents").toLocaleLowerCase("uz")} ·{" "}
                    {intervention.evidenceAssessmentIds.length}{" "}
                    {t("assessmentStatusAvailable").toLocaleLowerCase("uz")}
                  </p>
                </div>
                <div className="flex flex-wrap content-end gap-2">
                  {intervention.status === "SUGGESTED" ? (
                    <>
                      <Button
                        aria-label={`${t("approveIntervention")}: ${outcomes.get(intervention.outcomeId) ?? ""}`}
                        disabled={pending}
                        onClick={() => decideWith(intervention.id, "APPROVED")}
                        type="button"
                      >
                        <Check aria-hidden="true" />
                        {pending
                          ? t("decisionPending")
                          : t("approveIntervention")}
                      </Button>
                      <Button
                        aria-label={`${t("rejectIntervention")}: ${outcomes.get(intervention.outcomeId) ?? ""}`}
                        disabled={pending}
                        onClick={() => decideWith(intervention.id, "REJECTED")}
                        type="button"
                        variant="outline"
                      >
                        <X aria-hidden="true" />
                        {t("rejectIntervention")}
                      </Button>
                    </>
                  ) : (
                    <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Lightbulb aria-hidden="true" className="size-4" />
                      {t("professorApprovalRequired")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
