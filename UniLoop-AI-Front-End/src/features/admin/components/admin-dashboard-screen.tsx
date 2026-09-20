"use client";

import { useState } from "react";
import { Search, UsersRound, Presentation, ShieldCheck, Check, X } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminOverview, useDecideClub } from "@/features/admin/queries";
import type { AdminOverview } from "@/types/admin";
import type { ClubRecord } from "@/types/opportunity";
import type { ProfessorSummary, StudentSummary } from "@/types/user";
import { t } from "@/i18n";

type AdminView = "overview" | "students" | "professors" | "clubs";

type AdminDashboardScreenProps = { view: AdminView };

function statusBadge(status: ClubRecord["status"]) {
  const details = {
    PENDING: { label: t("clubStatusPending"), className: "border-amber-200 bg-amber-50 text-amber-900" },
    APPROVED: { label: t("clubStatusApproved"), className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
    REJECTED: { label: t("clubStatusRejected"), className: "border-red-200 bg-red-50 text-red-800" },
  }[status];
  return <Badge className={details.className} variant="outline">{details.label}</Badge>;
}

function PersonDetails({ person, onClose }: { person: StudentSummary | ProfessorSummary; onClose: () => void }) {
  return (
    <Card className="border-primary/20 bg-primary/3">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{person.fullName}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{person.id}</p>
        </div>
        <Button aria-label={t("actionClose")} onClick={onClose} size="icon" variant="ghost"><X aria-hidden="true" /></Button>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
        <div><p className="text-muted-foreground">{t("adminUniversity")}</p><p className="font-medium">{person.university}</p></div>
        <div><p className="text-muted-foreground">{t("adminFaculty")}</p><p className="font-medium">{person.faculty}</p></div>
        <div><p className="text-muted-foreground">{t("adminRecordId")}</p><p className="font-medium">{person.id}</p></div>
        <div><p className="text-muted-foreground">{t("adminContact")}</p><p className="font-medium">{t("adminContactUnavailable")}</p></div>
      </CardContent>
    </Card>
  );
}

function PeopleSection({ kind, data }: { kind: "students" | "professors"; data: AdminOverview }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<StudentSummary | ProfessorSummary | null>(null);
  const people = kind === "students" ? data.students : data.professors;
  const filtered = people.filter((person) =>
    [person.fullName, person.id, person.faculty, person.university].some((value) =>
      value.toLowerCase().includes(search.toLowerCase()),
    ),
  );
  const title = kind === "students" ? t("navStudents") : t("navProfessors");
  return (
    <section className="space-y-5">
      <header><p className="text-sm font-medium text-primary">{t("roleAdmin")}</p><h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{kind === "students" ? t("adminStudentsDescription") : t("adminProfessorsDescription")}</p></header>
      <div className="relative max-w-xl"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("adminSearchPeople")} className="h-10 pl-9" onChange={(event) => setSearch(event.target.value)} placeholder={t("adminSearchPeople")} value={search} /></div>
      {selected ? <PersonDetails onClose={() => setSelected(null)} person={selected} /> : null}
      {filtered.length ? <div className="grid gap-3 lg:grid-cols-2">{filtered.map((person) => <button className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/3" key={person.id} onClick={() => setSelected(person)} type="button"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{person.fullName}</p><p className="mt-1 text-xs text-muted-foreground">{person.id}</p></div><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{kind === "students" ? <UsersRound className="size-5" /> : <Presentation className="size-5" />}</span></div><div className="mt-4 grid gap-1 text-sm text-muted-foreground"><span>{person.faculty}</span><span>{person.university}</span></div></button>)}</div> : <EmptyState />}
    </section>
  );
}

function ClubRequests({ data }: { data: AdminOverview }) {
  const decide = useDecideClub();
  const clubs = [...data.clubs].sort((a, b) => (a.status === "PENDING" ? -1 : 1) - (b.status === "PENDING" ? -1 : 1) || b.submittedAt.localeCompare(a.submittedAt));
  function submitDecision(club: ClubRecord, status: "APPROVED" | "REJECTED") {
    const action = status === "APPROVED" ? t("approveClub") : t("rejectClub");
    if (window.confirm(`${action}: ${club.title}?`)) decide.mutate({ clubId: club.id, status });
  }
  return <section className="space-y-5"><header><p className="text-sm font-medium text-primary">{t("roleAdmin")}</p><h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">{t("navClubRequests")}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("adminClubsDescription")}</p></header><div className="space-y-3">{clubs.length ? clubs.map((club) => <Card key={club.id}><CardContent className="space-y-4 pt-0"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-heading text-lg font-semibold">{club.title}</h2><p className="mt-1 text-sm text-muted-foreground">{club.description}</p></div>{statusBadge(club.status)}</div><div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-muted-foreground">{t("adminCreator")}</p><p className="font-medium">{club.creatorName}</p></div><div><p className="text-muted-foreground">{t("adminCategory")}</p><p className="font-medium">{club.topic}</p></div><div><p className="text-muted-foreground">{t("adminMembers")}</p><p className="font-medium">{club.memberCount}</p></div><div><p className="text-muted-foreground">{t("adminSubmitted")}</p><p className="font-medium">{new Date(club.submittedAt).toLocaleDateString("uz-UZ")}</p></div></div>{club.status === "PENDING" ? <div className="flex flex-wrap gap-2"><Button disabled={decide.isPending} onClick={() => submitDecision(club, "APPROVED")}><Check aria-hidden="true" data-icon="inline-start" />{t("approveClub")}</Button><Button disabled={decide.isPending} onClick={() => submitDecision(club, "REJECTED")} variant="outline"><X aria-hidden="true" data-icon="inline-start" />{t("rejectClub")}</Button></div> : null}</CardContent></Card>) : <EmptyState />}</div></section>;
}

function Overview({ data }: { data: AdminOverview }) {
  const stats = [
    [t("adminTotalStudents"), data.stats.totalStudents, UsersRound],
    [t("adminTotalProfessors"), data.stats.totalProfessors, Presentation],
    [t("adminPendingClubs"), data.stats.pendingClubs, ShieldCheck],
    [t("adminApprovedClubs"), data.stats.approvedClubs, Check],
    [t("adminRejectedClubs"), data.stats.rejectedClubs, X],
  ] as const;
  return <section className="space-y-6"><header><p className="text-sm font-medium text-primary">{t("roleAdmin")}</p><h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">{t("adminOverviewTitle")}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t("adminOverviewDescription")}</p></header><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats.map(([label, value, Icon]) => <Card key={label}><CardContent className="flex items-start justify-between pt-0"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 font-heading text-3xl font-semibold">{value}</p></div><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span></CardContent></Card>)}</div><Card><CardHeader><CardTitle>{t("adminRecentRequests")}</CardTitle></CardHeader><CardContent className="space-y-3">{data.clubs.filter((club) => club.status === "PENDING").slice(0, 3).map((club) => <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0" key={club.id}><div><p className="font-medium">{club.title}</p><p className="text-sm text-muted-foreground">{club.creatorName}</p></div>{statusBadge(club.status)}</div>)}{data.stats.pendingClubs === 0 ? <p className="text-sm text-muted-foreground">{t("adminNoPendingClubs")}</p> : null}</CardContent></Card></section>;
}

export function AdminDashboardScreen({ view }: AdminDashboardScreenProps) {
  const overview = useAdminOverview();
  if (overview.isLoading) return <PageContainer className="py-8"><LoadingState cards={5} /></PageContainer>;
  if (overview.isError) return <PageContainer className="py-8"><ErrorState retry={() => void overview.refetch()} /></PageContainer>;
  if (!overview.data) return <PageContainer className="py-8"><EmptyState /></PageContainer>;
  return <PageContainer className="space-y-8 py-8 sm:py-10">{view === "overview" ? <Overview data={overview.data} /> : view === "students" ? <PeopleSection data={overview.data} kind="students" /> : view === "professors" ? <PeopleSection data={overview.data} kind="professors" /> : <ClubRequests data={overview.data} />}</PageContainer>;
}
