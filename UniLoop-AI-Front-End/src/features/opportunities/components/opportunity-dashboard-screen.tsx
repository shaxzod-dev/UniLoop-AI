"use client";

import { CheckCircle2, MapPin, Search, UsersRound } from "lucide-react";
import { useState } from "react";
import { ContextState } from "@/components/feedback/context-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { MutationFeedback } from "@/components/feedback/mutation-feedback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AcademicEvidenceLinks } from "@/features/opportunities/components/academic-evidence-links";
import { CareerProfileCard } from "@/features/opportunities/components/career-profile-card";
import { ConsentControls } from "@/features/opportunities/components/consent-controls";
import { EndorsementPanel } from "@/features/opportunities/components/endorsement-panel";
import { GapAnalysis } from "@/features/opportunities/components/gap-analysis";
import { ProjectEvidenceList } from "@/features/opportunities/components/project-evidence-list";
import { ReadinessPanel } from "@/features/opportunities/components/readiness-panel";
import { RecommendationCard } from "@/features/opportunities/components/recommendation-card";
import { SkillEvidenceList } from "@/features/opportunities/components/skill-evidence-list";
import {
  useCreateClub,
  useClubCatalog,
  useJoinClub,
  useOpportunityDashboard,
} from "@/features/opportunities/queries";
import { t } from "@/i18n";
import type { CareerProfile, ClubCatalogItem, SkillGap } from "@/types/opportunity";

type OpportunitySection = "profile" | "jobs" | "network" | "clubs" | "endorsements";

export function OpportunityDashboardScreen({ section }: { section?: OpportunitySection }) {
  // The club catalogue is independent from career recommendations. Keeping it
  // in a separate client subtree prevents a visit to /clubs from waiting for
  // the recommendation dashboard and its profile-derived work.
  if (section === "clubs") return <ClubsScreen />;
  return <OpportunityDashboardContent section={section} />;
}

function OpportunityDashboardContent({ section }: { section?: OpportunitySection }) {
  const dashboard = useOpportunityDashboard();
  if (dashboard.isLoading)
    return (
      <PageContainer className="py-8">
        <LoadingState cards={6} />
      </PageContainer>
    );
  if (dashboard.isError)
    return (
      <PageContainer className="py-8">
        <ErrorState retry={() => void dashboard.refetch()} />
      </PageContainer>
    );
  if (!dashboard.data)
    return (
      <PageContainer className="py-8">
        <EmptyState />
      </PageContainer>
    );
  const { profile, gaps, recommendations, projects, endorsementRequests } =
    dashboard.data;
  const connections = recommendations.filter(
    (item) =>
      item.opportunity.type !== "JOB" && item.opportunity.type !== "INTERNSHIP",
  );
  const careers = recommendations.filter(
    (item) =>
      item.opportunity.type === "JOB" || item.opportunity.type === "INTERNSHIP",
  );
  const primary = connections.find(
    (item) => item.status !== "DISMISSED" && item.status !== "ACCEPTED",
  );
  const orderedConnections = primary
    ? [primary, ...connections.filter((item) => item.id !== primary.id)]
    : connections;
  const shows = (name: OpportunitySection) => !section || section === name;
  return (
    <PageContainer className="space-y-8 py-8 sm:py-10">
      <header>
        <p className="text-sm font-medium text-primary">
          {t("homeLoopDevelopment")}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          {t("navOpportunities")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("opportunityIntro")}
        </p>
      </header>
      {shows("profile") ? <section
        className="grid gap-4 lg:grid-cols-2"
        aria-label={t("careerProfile")}
      >
        <CareerProfileCard profile={profile} />
        <ReadinessPanel profile={profile} gaps={gaps} />
      </section> : null}
      {shows("clubs") ? <ClubsArea /> : null}
      {shows("profile") ? <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">
          {t("skillEvidence")}
        </h2>
        <AcademicEvidenceLinks />
        <SkillEvidenceList skills={profile.skills} studentLinks />
      </section> : null}
      {shows("profile") && projects.length ? <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">
          {t("projectEvidence")}
        </h2>
        <ProjectEvidenceList projects={projects} />
      </section> : null}
      {shows("profile") ? <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">
          {t("gapAnalysis")}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("gapIntro")}
        </p>
        <GapAnalysis gaps={gaps} />
      </section> : null}
      {shows("profile") ? <ProfileBottomSummary profile={profile} gaps={gaps} /> : null}
      {shows("network") ? <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">
          {t("navRecommendedConnections")}
        </h2>
        {!profile.consent.peerRecommendations ? (
          <ContextState
            title="noPeerConsentTitle"
            description="noPeerConsentDescription"
          />
        ) : null}
        {connections.length ? (
          <div className="grid items-start gap-4 lg:grid-cols-2">
            {orderedConnections.map((item) => (
              <RecommendationCard
                gaps={gaps}
                key={item.id}
                primary={item.id === primary?.id}
                profile={profile}
                recommendation={item}
              />
            ))}
          </div>
        ) : (
          <ContextState title="emptyTitle" description="emptyDescription" />
        )}
      </section> : null}
      {shows("jobs") ? <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">
          {t("recommendedCareer")}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("careerOpportunityNote")}
        </p>
        {careers.length ? (
          <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {careers.map((item) => (
              <RecommendationCard
                gaps={gaps}
                key={item.id}
                profile={profile}
                recommendation={item}
              />
            ))}
          </div>
        ) : (
          <ContextState title="emptyTitle" description="emptyDescription" />
        )}
      </section> : null}
      {shows("endorsements") ? <section
        className="grid items-start gap-4 xl:grid-cols-2"
        aria-label={t("navProfessorEndorsement")}
      >
        <EndorsementPanel
          availableProfessors={dashboard.data.availableProfessors}
          profile={profile}
          recommendations={recommendations}
          requests={endorsementRequests}
        />
        <ConsentControls consent={profile.consent} />
      </section> : null}
    </PageContainer>
  );
}

function ProfileBottomSummary({
  profile,
  gaps,
}: {
  profile: CareerProfile;
  gaps: SkillGap[];
}) {
  const verifiedSkills = profile.skills.filter((skill) =>
    skill.sources.some((source) => source.verification === "VERIFIED"),
  ).length;
  return (
    <section className="rounded-2xl border border-primary/15 bg-primary/3 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">{t("profileSummaryEyebrow")}</p>
          <h2 className="mt-1 font-heading text-xl font-semibold">{t("profileSummaryTitle")}</h2>
        </div>
        <CheckCircle2 aria-hidden="true" className="size-6 text-primary" />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-background p-4 ring-1 ring-border">
          <p className="text-2xl font-semibold">{profile.skills.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("profileSummarySkills")}</p>
        </div>
        <div className="rounded-xl bg-background p-4 ring-1 ring-border">
          <p className="text-2xl font-semibold">{verifiedSkills}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("profileSummaryVerified")}</p>
        </div>
        <div className="rounded-xl bg-background p-4 ring-1 ring-border">
          <p className="text-2xl font-semibold">{gaps.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("profileSummaryGaps")}</p>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">
        {gaps.length ? t("profileSummaryGapAction") : t("profileSummaryReadyAction")}
      </p>
    </section>
  );
}

function ClubsScreen() {
  return (
    <PageContainer className="space-y-8 py-8 sm:py-10">
      <header>
        <p className="text-sm font-medium text-primary">{t("homeLoopDevelopment")}</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">{t("navOpportunities")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t("opportunityIntro")}</p>
      </header>
      <ClubsArea />
    </PageContainer>
  );
}

function ClubsArea() {
  const createClub = useCreateClub();
  const clubs = useClubCatalog();
  const joinClub = useJoinClub();
  const [clubName, setClubName] = useState("");
  const [clubTopic, setClubTopic] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [clubSearch, setClubSearch] = useState("");
  const visibleClubs = (clubs.data ?? []).filter((club) =>
    [club.title, club.description, club.creatorName, ...club.skills]
      .join(" ")
      .toLocaleLowerCase("uz")
      .includes(clubSearch.trim().toLocaleLowerCase("uz")),
  );
  return (
    <section>
      <Card className="max-w-3xl border-primary/20">
        <CardHeader><CardTitle>{t("createClub")}</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => {
            event.preventDefault();
            if (!clubName.trim() || !clubTopic.trim() || !clubDescription.trim()) return;
            createClub.mutate({ title: clubName, topic: clubTopic, description: clubDescription }, {
              onSuccess: () => { setClubName(""); setClubTopic(""); setClubDescription(""); },
            });
          }}>
            <Input aria-label={t("clubName")} onChange={(event) => setClubName(event.target.value)} placeholder={t("clubName")} value={clubName} />
            <Input aria-label={t("clubTopic")} onChange={(event) => setClubTopic(event.target.value)} placeholder={t("clubTopic")} value={clubTopic} />
            <Input aria-label={t("clubDescription")} className="md:col-span-2" onChange={(event) => setClubDescription(event.target.value)} placeholder={t("clubDescription")} value={clubDescription} />
            <Button disabled={createClub.isPending} type="submit">{t("createClub")}</Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">{t("createClubHint")}</p>
          <MutationFeedback error={createClub.isError} pending={createClub.isPending} success={createClub.isSuccess} successMessage="clubCreated" />
        </CardContent>
      </Card>
      <div className="mt-8 space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><h2 className="font-heading text-xl font-semibold">{t("allClubs")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("clubsCatalogDescription")}</p></div>
          <div className="relative w-full sm:max-w-sm"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("clubSearch")} className="pl-9" onChange={(event) => setClubSearch(event.target.value)} placeholder={t("clubSearch")} value={clubSearch} /></div>
        </div>
        {clubs.isLoading ? <LoadingState cards={3} /> : clubs.isError ? <ErrorState retry={() => void clubs.refetch()} /> : visibleClubs.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleClubs.map((club) => <ClubCatalogCard club={club} joinPending={joinClub.isPending} key={club.id} onJoin={() => joinClub.mutate(club.id)} />)}</div> : <Card><CardContent className="pt-6 text-sm text-muted-foreground">{t("noClubsFound")}</CardContent></Card>}
        <MutationFeedback error={joinClub.isError} pending={joinClub.isPending} success={joinClub.isSuccess} successMessage="clubJoined" />
      </div>
    </section>
  );
}

function ClubCatalogCard({ club, joinPending, onJoin }: { club: ClubCatalogItem; joinPending: boolean; onJoin: () => void }) {
  const statusLabel = club.status === "APPROVED" ? "clubStatusApproved" : club.status === "PENDING" ? "clubStatusPending" : "clubStatusRejected";
  return <Card className="h-full"><CardHeader><div className="flex items-start justify-between gap-3"><CardTitle>{club.title}</CardTitle><Badge variant="outline">{t(statusLabel)}</Badge></div><p className="text-sm leading-6 text-muted-foreground">{club.description}</p></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap gap-2">{club.skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div><div className="space-y-1 text-sm text-muted-foreground"><p className="flex items-center gap-2"><UsersRound aria-hidden="true" className="size-4" />{club.memberCount} {t("clubMembers")}</p>{club.location ? <p className="flex items-center gap-2"><MapPin aria-hidden="true" className="size-4" />{club.location}</p> : null}<p>{t("clubOwner")}: {club.creatorName}</p></div>{club.membershipRole ? <p className="text-sm font-medium text-primary">{club.membershipRole === "OWNER" ? t("clubOwner") : t("clubJoined")}</p> : club.mayJoin ? <Button className="w-full" disabled={joinPending} onClick={onJoin}>{t("joinClub")}</Button> : <p className="text-sm text-muted-foreground">{club.status === "PENDING" ? t("clubPending") : t("clubRejected")}</p>}</CardContent></Card>;
}
