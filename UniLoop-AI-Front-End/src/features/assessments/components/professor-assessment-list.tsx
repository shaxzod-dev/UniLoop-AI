"use client";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClassInsight } from "@/features/class-insights/queries";
import { QuestionDifficultyTable } from "@/features/assessments/components/question-difficulty-table";
import { ProfessorCourseNavigation } from "@/features/courses/components/professor-course-navigation";
import { useCourse } from "@/features/courses/queries";
import { assessmentTypePresentation } from "@/features/assessments/presentation";
import { useProfessorAssessment } from "@/features/assessments/queries";
import { t } from "@/i18n";
import { env } from "@/lib/env";

export function ProfessorAssessmentList({ courseId }: { courseId: string }) {
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
        <LoadingState cards={2} />
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
  if (!course.data?.assessments.length || !insight.data)
    return (
      <PageContainer className="py-8">
        <EmptyState />
      </PageContainer>
    );
  const cohortAverage = insight.data.cohortMasteryPercentage;
  return (
    <PageContainer className="py-8 sm:py-10">
      <header className="mb-5">
        <p className="text-sm font-medium text-primary">
          {t("availableAssessments")}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">
          {course.data.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("assessmentStatusAvailable")}
        </p>
      </header>
      <ProfessorCourseNavigation courseId={courseId} />
      {!env.useMocks ? (
        <p className="mb-5 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          {t("authoringUnavailable")}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {course.data.assessments.map((assessment) => {
          const presentation = assessmentTypePresentation[assessment.type];
          const completion = assessment.submissionCount ?? "—";
          return (
            <Card key={assessment.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <CardTitle>{assessment.title}</CardTitle>
                  <Badge className={presentation.className} variant="outline">
                    {t(presentation.label)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    {t("assessmentQuestions")}
                  </p>
                  <p className="mt-1 font-semibold">
                    {assessment.questionCount}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("assessmentCompletion")}
                  </p>
                  <p className="mt-1 font-semibold">
                    {completion}/{insight.data.studentCount}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("cohortAverage")}</p>
                  <p className="mt-1 font-semibold">{cohortAverage}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("completionDate")}</p>
                  <p className="mt-1 font-semibold">—</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">{t("linkedOutcomes")}</p>
                  <p className="mt-1">
                    {course.data.outcomes.map((item) => item.title).join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {insight.data.questionDifficulty.length ? (
        <section className="mt-6">
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
      ) : null}
    </PageContainer>
  );
}
