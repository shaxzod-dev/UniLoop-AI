"use client";

import { ContextState } from "@/components/feedback/context-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { ReferralCandidateCard } from "@/features/referrals/components/referral-candidate-card";
import { useReferralCandidates } from "@/features/referrals/queries";
import { t } from "@/i18n";

export function ReferralsScreen() {
  const candidates = useReferralCandidates();
  if (
    candidates.isLoading ||
    (candidates.isFetching && !candidates.isFetchedAfterMount)
  )
    return (
      <PageContainer className="py-8">
        <LoadingState cards={3} />
      </PageContainer>
    );
  if (candidates.isError)
    return (
      <PageContainer className="py-8">
        <ErrorState retry={() => void candidates.refetch()} />
      </PageContainer>
    );
  return (
    <PageContainer className="space-y-6 py-8 sm:py-10">
      <header>
        <p className="text-sm font-medium text-primary">
          {t("professorDecision")}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          {t("navReferrals")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("referralIntro")}
        </p>
      </header>
      {candidates.data?.length ? (
        <div className="space-y-4">
          {candidates.data.map((candidate) => (
            <ReferralCandidateCard
              candidate={candidate}
              key={candidate.request.id}
            />
          ))}
        </div>
      ) : (
        <ContextState
          title="noCandidatesTitle"
          description="noCandidatesDescription"
          headingLevel={2}
        />
      )}
    </PageContainer>
  );
}
