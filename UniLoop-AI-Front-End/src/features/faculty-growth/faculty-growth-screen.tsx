"use client";

import { BookOpenCheck, FlaskConical, ListChecks } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGenerateProfessorGrowthPlan,
  useProfessorGrowthPlan,
} from "@/features/interventions/queries";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { MutationFeedback } from "@/components/feedback/mutation-feedback";
import { t } from "@/i18n";

export function FacultyGrowthScreen() {
  const generate = useGenerateProfessorGrowthPlan();
  const query = useProfessorGrowthPlan();
  const plan = query.data;
  if (query.isLoading)
    return (
      <PageContainer className="py-8">
        <LoadingState cards={2} />
      </PageContainer>
    );
  if (query.isError)
    return (
      <PageContainer className="py-8">
        <ErrorState retry={() => void query.refetch()} />
      </PageContainer>
    );
  if (!plan?.actions.length)
    return (
      <PageContainer className="py-8 sm:py-10">
        <header className="mb-7">
          <p className="text-sm font-medium text-primary">
            {t("facultyGrowth")}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold">
            {t("navLearningPlan")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("growthPlanDescription")}
          </p>
        </header>
        <EmptyState />
        <div className="mt-5 text-center">
          <Button
            disabled={generate.isPending}
            onClick={() => generate.mutate(undefined)}
            type="button"
          >
            <ListChecks aria-hidden="true" />
            {generate.isPending ? t("loading") : t("generateGrowthPlan")}
          </Button>
          <MutationFeedback
            pending={generate.isPending}
            error={generate.isError}
            success={generate.isSuccess}
            successMessage="growthPlanReady"
          />
        </div>
      </PageContainer>
    );
  return (
    <PageContainer className="py-8 sm:py-10">
      <header className="mb-7">
        <p className="text-sm font-medium text-primary">{t("facultyGrowth")}</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">
          {t("growthPlanReady")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("growthPlanDescription")}
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck
                aria-hidden="true"
                className="size-5 text-primary"
              />
              {t("growthGoalTeaching")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {plan.actions[0]?.reason ?? t("emptyState")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical
                aria-hidden="true"
                className="size-5 text-primary"
              />
              {t("growthGoalResearch")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("currentSuggestedTask")}
            </p>
          </CardContent>
        </Card>
      </section>
      <section className="mt-6">
        <h2 className="mb-3 font-heading text-xl font-semibold">
          {t("currentSuggestedTask")}
        </h2>
        <div className="space-y-3">
          {plan.actions.map((action) => (
            <Card key={action.title} size="sm">
              <CardHeader>
                <CardTitle>{action.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{action.reason}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
