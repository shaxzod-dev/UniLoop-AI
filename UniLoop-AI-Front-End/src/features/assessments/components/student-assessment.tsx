"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { AlertCircle, ArrowRight, Clock } from "lucide-react";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AssessmentQuestion } from "@/features/assessments/components/assessment-question";
import { AssessmentResult } from "@/features/assessments/components/assessment-result";
import {
  useAssessment,
  useSubmitAssessment,
} from "@/features/assessments/queries";
import { useCourse } from "@/features/courses/queries";
import { t } from "@/i18n";
import type { SubmissionResult } from "@/types/assessment";

type AssessmentFormValues = { answers: Record<string, string> };
const answerSchema = z.object({
  answers: z.record(z.string(), z.string().trim().min(1)),
});

export function StudentAssessment({ assessmentId }: { assessmentId: string }) {
  const assessment = useAssessment(assessmentId);
  const course = useCourse(assessment.data?.courseId ?? "", "STUDENT");
  const submit = useSubmitAssessment(
    assessmentId,
    assessment.data?.courseId ?? "",
  );
  const form = useForm<AssessmentFormValues>({
    defaultValues: { answers: {} },
  });
  const values = useWatch({ control: form.control, name: "answers" }) ?? {};
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmissionResult | null>(null);
  if (assessment.isLoading)
    return (
      <PageContainer className="py-8">
        <LoadingState cards={5} />
      </PageContainer>
    );
  if (assessment.isError || !assessment.data)
    return (
      <PageContainer className="py-8">
        <ErrorState
          retry={() => void assessment.refetch()}
          title="assessmentNotFound"
        />
      </PageContainer>
    );
  const questions = assessment.data.questions;
  const answered = questions.filter((question) =>
    Boolean(values[question.id]?.trim()),
  ).length;
  const onSubmit = form.handleSubmit((formValues) => {
    const missing = questions.filter(
      (question) => !formValues.answers[question.id]?.trim(),
    );
    const parsed = answerSchema.safeParse(formValues);
    if (missing.length || !parsed.success) {
      setErrors(
        Object.fromEntries(
          questions
            .filter((question) => !formValues.answers[question.id]?.trim())
            .map((question) => [question.id, t("answerRequired")]),
        ),
      );
      return;
    }
    setErrors({});
    const answers = questions.map((question) =>
      question.type === "MULTIPLE_CHOICE"
        ? {
            questionId: question.id,
            optionId: parsed.data.answers[question.id],
          }
        : { questionId: question.id, text: parsed.data.answers[question.id] },
    );
    submit.mutate({ answers }, { onSuccess: (data) => setResult(data) });
  });
  if (result)
    return (
      <PageContainer className="py-8 sm:py-10">
        <AssessmentResult
          answers={form.getValues("answers")}
          assessment={assessment.data}
          outcomeLabels={
            new Map(course.data?.outcomes.map((item) => [item.id, item.title]))
          }
          result={result}
        />
      </PageContainer>
    );
  return (
    <PageContainer className="py-8 sm:py-10">
      <header className="mb-6">
        <p className="text-sm font-medium text-primary">
          {assessment.data.type === "DIAGNOSTIC"
            ? t("diagnostic")
            : t("followUp")}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          {assessment.data.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-4" />
            {assessment.data.estimatedMinutes}{" "}
            {t("estimatedMinutes").toLocaleLowerCase("uz")}
          </span>
          <span>
            {answered}/{questions.length}{" "}
            {t("questionProgress").toLocaleLowerCase("uz")}
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("assessmentInstructions")}
        </p>
      </header>
      <Card className="mb-6">
        <CardContent className="pt-4">
          <Progress
            aria-label={t("questionProgress")}
            value={questions.length ? (answered / questions.length) * 100 : 0}
          />
        </CardContent>
      </Card>
      <form className="space-y-4" onSubmit={onSubmit}>
        {questions.map((question, index) => (
          <AssessmentQuestion
            error={errors[question.id]}
            index={index}
            key={question.id}
            onChange={(value) =>
              form.setValue(`answers.${question.id}`, value, {
                shouldDirty: true,
              })
            }
            question={question}
            value={values[question.id]}
          />
        ))}
        {submit.isError ? (
          <p
            className="flex items-center gap-2 rounded-lg bg-destructive/5 p-3 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle aria-hidden="true" className="size-4" />
            {t("apiValidationError")}
          </p>
        ) : null}
        <div className="flex justify-end">
          <Button disabled={submit.isPending} size="lg" type="submit">
            {submit.isPending
              ? t("submittingAssessment")
              : t("submitAssessment")}
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
