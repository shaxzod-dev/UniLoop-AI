import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Map as MapIcon,
  NotebookTabs,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/i18n";
import type { Assessment, SubmissionResult } from "@/types/assessment";

export function AssessmentResult({
  assessment,
  answers,
  outcomeLabels,
  result,
}: {
  assessment: Assessment;
  answers: Record<string, string>;
  outcomeLabels: Map<string, string>;
  result: SubmissionResult;
}) {
  const questions = new Map(
    assessment.questions.map((item) => [item.id, item]),
  );
  const correctCount = result.feedback.filter((item) => item.correct).length;
  return (
    <section aria-live="polite">
      <header className="mb-6">
        <p className="text-sm font-medium text-primary">
          {t("assessmentResult")}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          {assessment.title}
        </h1>
      </header>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>{t("score")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">
              {result.scorePercentage}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("correctAnswers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">
              {correctCount}/{assessment.questions.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("aiRecommendation")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {result.aiExplanation}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("recommendationNotice")}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        {result.feedback.map((feedback, index) => {
          const question = questions.get(feedback.questionId);
          const answerValue = answers[feedback.questionId];
          const answer =
            question?.type === "MULTIPLE_CHOICE"
              ? question.options.find((option) => option.id === answerValue)
                  ?.text
              : answerValue;
          return (
            <Card key={feedback.questionId}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <CardTitle>
                    {t("question")} {index + 1}
                  </CardTitle>
                  <Badge
                    className={
                      feedback.correct
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-900"
                    }
                    variant="outline"
                  >
                    {feedback.correct ? (
                      <CheckCircle2 aria-hidden="true" />
                    ) : (
                      <CircleAlert aria-hidden="true" />
                    )}
                    {t(feedback.correct ? "correct" : "incorrect")}
                  </Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {question?.prompt}
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <p className="font-medium">{t("yourAnswer")}</p>
                  <p className="mt-1 text-muted-foreground">{answer || "—"}</p>
                </div>
                <div>
                  <p className="font-medium">{t("correctAnswer")}</p>
                  <p className="mt-1 text-muted-foreground">
                    {feedback.correctAnswer}
                  </p>
                </div>
                <div>
                  <p className="font-medium">{t("feedback")}</p>
                  <p className="mt-1 text-muted-foreground">
                    {feedback.explanation}
                  </p>
                </div>
                <div>
                  <p className="font-medium">{t("affectedOutcome")}</p>
                  <p className="mt-1 text-muted-foreground">
                    {outcomeLabels.get(feedback.outcomeId) ??
                      t("learningOutcomes")}
                  </p>
                  {feedback.misconception ? (
                    <>
                      <p className="mt-3 font-medium">{t("misconception")}</p>
                      <p className="mt-1 text-muted-foreground">
                        {feedback.misconception}
                      </p>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link href={`/student/mastery/${assessment.courseId}`}>
            <MapIcon aria-hidden="true" />
            {t("openKnowledgeMap")}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/student/learning-plan/${assessment.courseId}`}>
            <NotebookTabs aria-hidden="true" />
            {t("openLearningPlan")}
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={`/student/courses/${assessment.courseId}`}>
            {t("returnToCourse")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
