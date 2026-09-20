"use client";

import { ContextState } from "@/components/feedback/context-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GapAnalysis } from "@/features/opportunities/components/gap-analysis";
import { ProjectEvidenceList } from "@/features/opportunities/components/project-evidence-list";
import { SkillEvidenceList } from "@/features/opportunities/components/skill-evidence-list";
import { readinessPresentation } from "@/features/opportunities/presentation";
import { AcademicEvidenceCard } from "@/features/referrals/components/academic-evidence-card";
import { EndorsementDecisionForm } from "@/features/referrals/components/endorsement-decision-form";
import { useStudentEvidence } from "@/features/referrals/queries";
import { t } from "@/i18n";
import type { ReferralCandidate } from "@/types/endorsement";

export function StudentEvidencePanel({
  candidate,
}: {
  candidate: ReferralCandidate;
}) {
  const evidence = useStudentEvidence(candidate.student.id);
  if (
    evidence.isLoading ||
    (evidence.isFetching && !evidence.isFetchedAfterMount)
  )
    return <LoadingState cards={4} />;
  if (evidence.isError) {
    if (evidence.error.code === "FORBIDDEN")
      return (
        <ContextState
          title="noReviewConsentTitle"
          description="noReviewConsentDescription"
        >
          <Button
            className="mt-3 min-h-11"
            onClick={() => void evidence.refetch()}
            type="button"
            variant="outline"
          >
            {t("retryAction")}
          </Button>
        </ContextState>
      );
    return <ErrorState retry={() => void evidence.refetch()} />;
  }
  if (!evidence.data)
    return (
      <ContextState
        title="noEvidenceTitle"
        description="noEvidenceDescription"
      />
    );
  const data = evidence.data;
  if (!data.reviewConsent || !data.requestIds.includes(candidate.request.id))
    return (
      <ContextState
        title="noReviewConsentTitle"
        description="noReviewConsentDescription"
      />
    );
  const empty =
    !data.academic.length &&
    !data.projects.length &&
    !data.technicalSkills.length;
  const readiness = readinessPresentation[data.readinessStage];
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        <p>{t("reviewConsentContext")}</p>
        <p className="mt-2">{t("reviewEvidencePrinciple")}</p>
      </div>
      <section className="space-y-3">
        <h3 className="font-heading text-lg font-semibold">
          {t("observedEvidence")}
        </h3>
        {empty ? (
          <ContextState
            title="noEvidenceTitle"
            description="noEvidenceDescription"
          />
        ) : (
          <div className="space-y-4">
            {data.academic.map((mastery) => (
              <AcademicEvidenceCard key={mastery.courseId} mastery={mastery} />
            ))}
            <h4 className="font-heading font-semibold">
              {t("projectEvidence")}
            </h4>
            <ProjectEvidenceList projects={data.projects} headingLevel={4} />
            <h4 className="font-heading font-semibold">
              {t("technicalEvidence")}
            </h4>
            <SkillEvidenceList skills={data.technicalSkills} headingLevel={4} />
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <h4 className="text-sm font-semibold">
              {t("collaborationEvidence")}
            </h4>
            {data.collaborationEvidence.length ? (
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {data.collaborationEvidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {t("noCollaborationEvidence")}
              </p>
            )}
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="text-sm font-semibold">
              {t("communicationEvidence")}
            </h4>
            {data.communicationEvidence.length ? (
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {data.communicationEvidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {t("noCommunicationEvidence")}
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="font-heading text-lg font-semibold">
          {t("deterministicAnalysis")}
        </h3>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm">
            {t("targetRole")}: <strong>{data.targetRole}</strong>
          </p>
          <Badge
            className={`whitespace-normal ${readiness.className}`}
            variant="outline"
          >
            {t(readiness.label)}
          </Badge>
        </div>
        <GapAnalysis gaps={data.gaps} headingLevel={4} />
      </section>
      <section className="rounded-xl border border-border bg-muted/30 p-5">
        <h3 className="font-heading text-lg font-semibold">
          {t("aiEvidenceSummary")}
        </h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {data.aiSummary || t("noEvidenceDescription")}
        </p>
      </section>
      <EndorsementDecisionForm
        request={candidate.request}
        studentName={data.student.fullName}
      />
    </div>
  );
}
