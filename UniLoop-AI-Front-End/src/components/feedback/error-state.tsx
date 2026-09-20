"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n";

export function ErrorState({
  retry,
  title = "errorTitle",
}: {
  retry: () => void;
  title?:
    | "errorTitle"
    | "courseNotFound"
    | "assessmentNotFound"
    | "professorCourseNotFound"
    | "surveyErrorTitle";
}) {
  return (
    <section
      className="rounded-xl border border-destructive/25 bg-destructive/5 p-6 text-center"
      role="alert"
    >
      <AlertCircle
        aria-hidden="true"
        className="mx-auto mb-3 size-6 text-destructive"
      />
      <h1 className="font-heading text-lg font-semibold">{t(title)}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {t("errorDescription")}
      </p>
      <Button className="mt-4" onClick={retry} type="button" variant="outline">
        {t("retryAction")}
      </Button>
    </section>
  );
}
