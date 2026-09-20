"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  endorsementPresentation,
  formatEvidenceDate,
  readinessPresentation,
} from "@/features/opportunities/presentation";
import { StudentEvidencePanel } from "@/features/referrals/components/student-evidence-panel";
import { t } from "@/i18n";
import type { ReferralCandidate } from "@/types/endorsement";

export function ReferralCandidateCard({
  candidate,
}: {
  candidate: ReferralCandidate;
}) {
  const [open, setOpen] = useState(false);
  const status = endorsementPresentation[candidate.request.status];
  const readiness = readinessPresentation[candidate.readinessStage];
  return (
    <article className="min-w-0 rounded-xl border border-border bg-card">
      <div className="space-y-3 p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <div>
            <h2 className="font-heading text-xl font-semibold">
              {candidate.student.fullName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {candidate.request.targetRole}
            </p>
          </div>
          <Badge
            className={`self-start whitespace-normal ${status.className}`}
            variant="outline"
          >
            {t(status.label)}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Badge className={readiness.className} variant="outline">
            {t(readiness.label)}
          </Badge>
          <p>
            {t("overallMastery")}:{" "}
            <strong>{candidate.overallMasteryPercentage}%</strong>
          </p>
          <p className="text-muted-foreground">
            {t("requestedAt")}:{" "}
            <time dateTime={candidate.request.requestedAt}>
              {formatEvidenceDate(candidate.request.requestedAt)}
            </time>
          </p>
        </div>
        {candidate.request.professorFeedback ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {t("professorFeedback")}: {candidate.request.professorFeedback}
          </p>
        ) : null}
      </div>
      <details
        className="border-t border-border"
        onToggle={(event) => setOpen(event.currentTarget.open)}
      >
        <summary className="min-h-11 cursor-pointer px-5 py-4 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          {t("reviewEvidence")}: {candidate.student.fullName}
        </summary>
        {open ? (
          <div className="border-t border-border p-4 sm:p-5">
            <StudentEvidencePanel candidate={candidate} />
          </div>
        ) : null}
      </details>
    </article>
  );
}
