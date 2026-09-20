"use client";

import Link from "next/link";
import { ContextState } from "@/components/feedback/context-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Badge } from "@/components/ui/badge";
import { useCourse } from "@/features/courses/queries";
import {
  formatMasteryPercentage,
  masteryPresentation,
} from "@/features/mastery/presentation";
import {
  evidenceSourcePresentation,
  verificationPresentation,
} from "@/features/opportunities/presentation";
import { t } from "@/i18n";
import type { MasterySummary } from "@/types/mastery";

export function AcademicEvidenceCard({ mastery }: { mastery: MasterySummary }) {
  const course = useCourse(mastery.courseId, "PROFESSOR");
  if (course.isLoading) return <LoadingState cards={1} />;
  if (course.isError) return <ErrorState retry={() => void course.refetch()} />;
  if (!course.data || !mastery.outcomes.length)
    return (
      <ContextState
        title="noEvidenceTitle"
        description="noEvidenceDescription"
      />
    );
  const outcomes = new Map(
    course.data.outcomes.map((item) => [item.id, item.title]),
  );
  const assessments = new Map(
    course.data.assessments.map((item) => [item.id, item.title]),
  );
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex flex-wrap justify-between gap-3">
        <h4 className="font-heading font-semibold">{course.data.title}</h4>
        <p className="text-sm">
          {t("overallMastery")}:{" "}
          <strong>{formatMasteryPercentage(mastery)}</strong>
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {mastery.outcomes.map((outcome) => (
          <div
            className="rounded-lg border border-border p-3"
            key={outcome.outcomeId}
          >
            <p className="text-sm font-medium">
              {outcomes.get(outcome.outcomeId) ?? t("learningOutcomes")}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <strong className="text-sm">{outcome.percentage}%</strong>
              <Badge
                className={masteryPresentation[outcome.level].className}
                variant="outline"
              >
                {t(masteryPresentation[outcome.level].label)}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("diagnosticScore")}:{" "}
              {outcome.diagnosticPercentage === null
                ? "—"
                : `${outcome.diagnosticPercentage}%`}{" "}
              · {t("followUpScore")}:{" "}
              {outcome.followUpPercentage === null
                ? "—"
                : `${outcome.followUpPercentage}%`}
            </p>
            <ul className="mt-3 space-y-2">
              {outcome.evidence.map((source) => (
                <li className="text-xs" key={`${source.type}-${source.id}`}>
                  <Link
                    className="inline-block min-h-11 py-3 text-primary underline underline-offset-4"
                    href={`/professor/courses/${mastery.courseId}/assessments`}
                  >
                    {assessments.get(source.id) ??
                      t(evidenceSourcePresentation[source.type].label)}
                  </Link>
                  <Badge
                    className={`ml-2 ${verificationPresentation[source.verification].className}`}
                    variant="outline"
                  >
                    {t(verificationPresentation[source.verification].label)}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}
