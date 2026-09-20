"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Map as MapIcon,
  NotebookTabs,
} from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourse, useCourses } from "@/features/courses/queries";
import { useMastery } from "@/features/mastery/queries";
import {
  formatMasteryPercentage,
  masteryPresentation,
} from "@/features/mastery/presentation";
import { t } from "@/i18n";

export function StudentCourseDetail({ courseId }: { courseId: string }) {
  const enrolled = useCourses("STUDENT");
  const hasCourse = enrolled.data?.some((course) => course.id === courseId) === true;
  const course = useCourse(courseId, "STUDENT", hasCourse);
  const mastery = useMastery(courseId, hasCourse);
  if (enrolled.isLoading || (hasCourse && (course.isLoading || mastery.isLoading)))
    return (
      <PageContainer className="py-8">
        <LoadingState cards={4} />
      </PageContainer>
    );
  if (enrolled.isError || !hasCourse || course.isError || mastery.isError)
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
  if (!course.data)
    return (
      <PageContainer className="py-8">
        <EmptyState />
      </PageContainer>
    );
  const outcomeById = new Map(
    mastery.data?.outcomes.map((item) => [item.outcomeId, item]),
  );
  const diagnostic = course.data.assessments.find(
    (item) => item.type === "DIAGNOSTIC",
  );
  return (
    <PageContainer className="py-8 sm:py-10">
      <header className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">{course.data.code}</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            {course.data.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {course.data.description}
          </p>
          <p className="mt-3 text-sm">{course.data.professor.fullName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/student/mastery/${courseId}`}>
              <MapIcon aria-hidden="true" />
              {t("openKnowledgeMap")}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/student/learning-plan/${courseId}`}>
              <NotebookTabs aria-hidden="true" />
              {t("openLearningPlan")}
            </Link>
          </Button>
        </div>
      </header>
      <section className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("overallMastery")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">
              {formatMasteryPercentage(mastery.data)}
            </p>
            <Progress
              aria-label={t("accessibilityProgress")}
              className="mt-4"
              value={mastery.data?.overallPercentage ?? 0}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("latestFeedback")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {course.data.latestFeedback ?? t("emptyState")}
            </p>
          </CardContent>
        </Card>
      </section>
      <section className="mb-6">
        <h2 className="mb-3 font-heading text-xl font-semibold">
          {t("learningOutcomes")}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {course.data.outcomes.map((outcome) => {
            const item = outcomeById.get(outcome.id);
            return (
              <Card key={outcome.id} size="sm">
                <CardHeader>
                  <div className="flex justify-between gap-3">
                    <CardTitle>{outcome.title}</CardTitle>
                    {item ? (
                      <Badge
                        className={masteryPresentation[item.level].className}
                        variant="outline"
                      >
                        {t(masteryPresentation[item.level].label)}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {outcome.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("overallMastery")}</span>
                    <strong>{item?.percentage ?? 0}%</strong>
                  </div>
                  <Progress className="mt-2" value={item?.percentage ?? 0} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-heading text-xl font-semibold">
            {t("courseMaterials")}
          </h2>
          {course.data.materials.length ? (
            <div className="space-y-3">
              {course.data.materials.map((material) => (
                <Card key={material.id} size="sm">
                  <CardHeader>
                    <CardTitle>{material.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {material.content}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {t("materialNoAction")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
        <div>
          <h2 className="mb-3 font-heading text-xl font-semibold">
            {t("availableAssessments")}
          </h2>
          <div className="space-y-3">
            {course.data.assessments.map((assessment) => (
              <Card key={assessment.id} size="sm">
                <CardHeader>
                  <div className="flex justify-between gap-3">
                    <CardTitle>{assessment.title}</CardTitle>
                    <Badge variant="outline">
                      {t(
                        assessment.type === "DIAGNOSTIC"
                          ? "diagnostic"
                          : "followUp",
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {assessment.questionCount} {t("assessmentQuestions")}
                  </p>
                </CardHeader>
                <CardContent>
                  {assessment.id === diagnostic?.id ? (
                    <Button asChild size="sm">
                      <Link href={`/student/assessments/${assessment.id}`}>
                        <ClipboardCheck aria-hidden="true" />
                        {t("openAssessment")}
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/student/learning-plan/${courseId}`}>
                        {t("openLearningPlan")}
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
