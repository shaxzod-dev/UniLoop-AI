"use client";

import { useRef, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ContextState } from "@/components/feedback/context-state";
import { MutationFeedback } from "@/components/feedback/mutation-feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  endorsementPresentation,
  formatEvidenceDate,
} from "@/features/opportunities/presentation";
import { useRequestEndorsement } from "@/features/opportunities/queries";
import { t } from "@/i18n";
import type { EndorsementRequest } from "@/types/endorsement";
import type { CareerProfile, Recommendation } from "@/types/opportunity";

const requestFormSchema = z.object({
  professorId: z.string().min(1),
  opportunityId: z.string(),
  consentToReview: z.boolean().refine(Boolean, t("reviewConsentRequired")),
});
type RequestFormValues = z.infer<typeof requestFormSchema>;

export function EndorsementPanel({
  profile,
  requests,
  recommendations,
  availableProfessors,
}: {
  profile: CareerProfile;
  requests: EndorsementRequest[];
  recommendations: Recommendation[];
  availableProfessors: { id: string; fullName: string }[];
}) {
  const request = useRequestEndorsement();
  const locked = useRef(false);
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      professorId: availableProfessors[0]?.id ?? "",
      opportunityId: "",
      consentToReview: false,
    },
  });
  const careerRecommendations = recommendations.filter(
    (item) =>
      item.opportunity.type === "JOB" || item.opportunity.type === "INTERNSHIP",
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    void form.handleSubmit((values) => {
      if (locked.current) return;
      locked.current = true;
      request.mutate(
        {
          professorId: values.professorId,
          targetRole: profile.targetRole,
          consentToReview: values.consentToReview,
          ...(values.opportunityId
            ? { opportunityId: values.opportunityId }
            : {}),
        },
        {
          onSuccess: () =>
            form.reset({
              professorId: values.professorId,
              opportunityId: "",
              consentToReview: false,
            }),
          onSettled: () => {
            locked.current = false;
          },
        },
      );
    })(event);
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{t("navProfessorEndorsement")}</h2>
        </CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("endorsementIntro")}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {!profile.consent.professorEvidenceReview ? (
          <ContextState
            title="professorConsentOffTitle"
            description="professorConsentOffDescription"
          />
        ) : null}
        {requests.length ? (
          <div className="space-y-3">
            {requests.map((item) => {
              const presentation = endorsementPresentation[item.status];
              const opportunity = recommendations.find(
                (entry) => entry.opportunity.id === item.opportunityId,
              )?.opportunity;
              return (
                <article
                  className="rounded-lg border border-border p-4"
                  key={item.id}
                >
                  <Badge
                    className={`whitespace-normal ${presentation.className}`}
                    variant="outline"
                  >
                    {t(presentation.label)}
                  </Badge>
                  <p className="mt-3 text-sm font-medium">{item.targetRole}</p>
                  {opportunity ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {opportunity.title}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("requestedAt")}:{" "}
                    <time dateTime={item.requestedAt}>
                      {formatEvidenceDate(item.requestedAt)}
                    </time>
                  </p>
                  {item.professorFeedback ? (
                    <p className="mt-3 text-sm leading-6">
                      <span className="font-medium">
                        {t("professorFeedback")}:{" "}
                      </span>
                      {item.professorFeedback}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <ContextState
            title="noEndorsementTitle"
            description="noEndorsementDescription"
          />
        )}
        <form className="space-y-4" onSubmit={submit}>
            <div>
              <p className="text-xs text-muted-foreground">{t("targetRole")}</p>
              <p className="mt-1 text-sm font-medium">{profile.targetRole}</p>
              <Label htmlFor="endorsement-professor">
                {t("roleProfessor")}
              </Label>
              <select
                id="endorsement-professor"
                className="mt-2 min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                disabled={request.isPending || !availableProfessors.length}
                {...form.register("professorId")}
              >
                {availableProfessors.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endorsement-opportunity">
                {t("endorsementOpportunity")}
              </Label>
              <select
                className="min-h-11 w-full max-w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                id="endorsement-opportunity"
                disabled={request.isPending}
                {...form.register("opportunityId")}
              >
                <option value="">{t("roleOnlyRequest")}</option>
                {careerRecommendations.map((item) => (
                  <option value={item.opportunity.id} key={item.id}>
                    {item.opportunity.title}
                  </option>
                ))}
              </select>
            </div>
            <label
              className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6"
              htmlFor="endorsement-consent"
            >
              <input
                className="mt-1 size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                id="endorsement-consent"
                type="checkbox"
                disabled={request.isPending}
                aria-invalid={Boolean(form.formState.errors.consentToReview)}
                aria-describedby="endorsement-consent-hint endorsement-consent-error"
                {...form.register("consentToReview")}
              />
              <span>{t("reviewConsentLabel")}</span>
            </label>
            <p
              className="text-xs leading-5 text-muted-foreground"
              id="endorsement-consent-hint"
            >
              {t("reviewConsentHint")}
            </p>
            <p
              className="text-sm text-destructive"
              id="endorsement-consent-error"
            >
              {form.formState.errors.consentToReview?.message}
            </p>
            <Button
              className="min-h-11"
              disabled={request.isPending}
              type="submit"
            >
              {t("requestEndorsement")}
            </Button>
        </form>
        <MutationFeedback
          pending={request.isPending}
          error={request.isError}
          success={request.isSuccess}
          successMessage="endorsementSubmitted"
        />
      </CardContent>
    </Card>
  );
}
