"use client";

import { useRef, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { MutationFeedback } from "@/components/feedback/mutation-feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { consentSchema } from "@/features/opportunities/contracts";
import { consentPresentation } from "@/features/opportunities/presentation";
import { useUpdateCareerProfile } from "@/features/opportunities/queries";
import { t } from "@/i18n";
import type { CareerProfile } from "@/types/opportunity";

const controls = [
  {
    key: "discoverable",
    label: "discoverability",
    description: "discoverabilityDescription",
  },
  {
    key: "peerRecommendations",
    label: "peerConsent",
    description: "peerConsentDescription",
  },
  {
    key: "professorEvidenceReview",
    label: "professorReviewConsent",
    description: "professorReviewDescription",
  },
] as const;

export function ConsentControls({
  consent,
}: {
  consent: CareerProfile["consent"];
}) {
  const update = useUpdateCareerProfile();
  const locked = useRef(false);
  const form = useForm<CareerProfile["consent"]>({
    resolver: zodResolver(consentSchema),
    values: consent,
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    void form.handleSubmit((values) => {
      if (locked.current) return;
      locked.current = true;
      update.mutate(
        { consent: values },
        {
          onSettled: () => {
            locked.current = false;
          },
        },
      );
    })(event);
  }
  return (
    <Card id="privacy-consent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
          <h2>{t("privacyConsent")}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <fieldset className="space-y-4" disabled={update.isPending}>
            <legend className="sr-only">{t("privacyConsent")}</legend>
            {controls.map((control) => {
              const presentation =
                consentPresentation[
                  consent[control.key] ? "enabled" : "disabled"
                ];
              return (
                <div
                  className="rounded-lg border border-border p-4"
                  key={control.key}
                >
                  <label
                    className="flex min-h-11 cursor-pointer items-start gap-3"
                    htmlFor={`consent-${control.key}`}
                  >
                    <input
                      className="mt-1 size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                      id={`consent-${control.key}`}
                      type="checkbox"
                      aria-describedby={`consent-${control.key}-description`}
                      {...form.register(control.key)}
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        {t(control.label)}
                      </span>
                      <span
                        className="mt-1 block text-xs leading-5 text-muted-foreground"
                        id={`consent-${control.key}-description`}
                      >
                        {t(control.description)}
                      </span>
                    </span>
                  </label>
                  <Badge
                    className={`mt-2 ${presentation.className}`}
                    variant="outline"
                  >
                    {t(presentation.label)}
                  </Badge>
                </div>
              );
            })}
          </fieldset>
          <Button
            className="min-h-11"
            disabled={update.isPending || !form.formState.isDirty}
            type="submit"
          >
            {t("actionSave")}
          </Button>
          <MutationFeedback
            pending={update.isPending}
            error={update.isError}
            success={update.isSuccess}
            successMessage="consentSaved"
          />
        </form>
      </CardContent>
    </Card>
  );
}
