"use client";

import { ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/shared/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/i18n";
import type { UserRole } from "@/features/auth/types";
import { FeedbackPanel } from "@/features/feedback/components/feedback-panel";

export function SurveysScreen({ role }: { role: UserRole }) {
  return (
    <PageContainer className="space-y-6 py-8 sm:py-10">
      <header>
        <p className="text-sm font-medium text-primary">{t("navSurveys")}</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          {t("navSurveys")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("surveysIntro")}
        </p>
      </header>
      <Card className="border-primary/15 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-primary"
          />
          <p className="text-sm leading-6 text-muted-foreground">
            {t("surveyPrivacyNote")}
          </p>
        </CardContent>
      </Card>
      <FeedbackPanel role={role} />
    </PageContainer>
  );
}
