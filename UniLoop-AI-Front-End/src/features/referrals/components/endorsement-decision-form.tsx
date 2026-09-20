"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MutationFeedback } from "@/components/feedback/mutation-feedback";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { professorDecisionPresentation } from "@/features/opportunities/presentation";
import { useDecideEndorsement } from "@/features/referrals/queries";
import { t } from "@/i18n";
import type {
  EndorsementDecision,
  EndorsementRequest,
} from "@/types/endorsement";

const feedbackFormSchema = z.object({
  feedback: z.string().trim().max(2000, t("feedbackValidation")),
});
type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;
const decisions = ["APPROVED", "NEEDS_DEVELOPMENT", "DECLINED"] as const;

export function EndorsementDecisionForm({
  request,
  studentName,
}: {
  request: EndorsementRequest;
  studentName: string;
}) {
  const decide = useDecideEndorsement();
  const locked = useRef(false);
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: { feedback: "" },
  });
  function submitDecision(
    status: EndorsementDecision["status"],
    values: FeedbackFormValues,
  ) {
    if (locked.current || decide.isPending) return;
    locked.current = true;
    decide.mutate(
      {
        requestId: request.id,
        status,
        ...(values.feedback ? { feedback: values.feedback } : {}),
      },
      {
        onSettled: () => {
          locked.current = false;
        },
      },
    );
  }
  return (
    <section className="space-y-4 rounded-xl border border-primary/20 bg-card p-5">
      <h3 className="font-heading text-lg font-semibold">
        {t("professorDecision")}
      </h3>
      <p className="text-sm leading-6 text-muted-foreground">
        {t("decisionAuthorityNote")}
      </p>
      {request.status === "REQUESTED" ? (
        <form
          className="space-y-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="space-y-2">
            <Label htmlFor={`endorsement-feedback-${request.id}`}>
              {t("professorFeedback")}
            </Label>
            <textarea
              className="min-h-24 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
              id={`endorsement-feedback-${request.id}`}
              disabled={decide.isPending}
              aria-invalid={Boolean(form.formState.errors.feedback)}
              aria-describedby={`feedback-hint-${request.id} feedback-error-${request.id}`}
              {...form.register("feedback")}
            />
            <p
              className="text-xs text-muted-foreground"
              id={`feedback-hint-${request.id}`}
            >
              {t("feedbackHint")}
            </p>
            <p
              className="text-sm text-destructive"
              id={`feedback-error-${request.id}`}
            >
              {form.formState.errors.feedback?.message}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {decisions.map((status) => (
              <Button
                className="min-h-11"
                aria-label={`${t(professorDecisionPresentation[status].label)}: ${studentName}, ${request.targetRole}`}
                disabled={decide.isPending}
                key={status}
                onClick={(event) => {
                  void form.handleSubmit((values) =>
                    submitDecision(status, values),
                  )(event);
                }}
                type="button"
                variant={status === "APPROVED" ? "default" : "outline"}
              >
                {t(professorDecisionPresentation[status].label)}
              </Button>
            ))}
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("decisionAlreadyRecorded")}
        </p>
      )}
      <MutationFeedback
        pending={decide.isPending}
        error={decide.isError}
        success={decide.isSuccess}
        successMessage="decisionSuccess"
      />
    </section>
  );
}
