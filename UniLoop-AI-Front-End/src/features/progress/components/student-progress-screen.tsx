"use client";

import { useState } from "react";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStudentProgress } from "@/features/progress/queries";
import { t } from "@/i18n";

const stageLabel = { FOUNDATION: "Foundation", PROJECT_READY: "Project ready", INTERNSHIP_READY: "Internship ready", JUNIOR_READY: "Junior ready" } as const;

export function StudentProgressScreen() {
  const [tab, setTab] = useState<"academic" | "career">("academic");
  const progress = useStudentProgress();
  if (progress.isLoading) return <PageContainer className="py-8"><LoadingState cards={4} /></PageContainer>;
  if (progress.isError || !progress.data) return <PageContainer className="py-8"><ErrorState retry={() => void progress.refetch()} /></PageContainer>;
  const { academic, readiness } = progress.data;
  return <PageContainer className="space-y-6 py-8"><header><p className="text-sm font-medium text-primary">{t("homeLoopDevelopment")}</p><h1 className="mt-1 font-heading text-3xl font-semibold">{t("navMyProgress")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("progressIntro")}</p></header><div className="flex gap-2" role="tablist"><Button aria-selected={tab === "academic"} onClick={() => setTab("academic")} role="tab" variant={tab === "academic" ? "default" : "outline"}>{t("academicProgress")}</Button><Button aria-selected={tab === "career"} onClick={() => setTab("career")} role="tab" variant={tab === "career" ? "default" : "outline"}>{t("careerReadiness")}</Button></div>{tab === "academic" ? <section className="space-y-4"><Card><CardHeader><CardTitle>{t("nextBestAction")}</CardTitle></CardHeader><CardContent>{academic.nextAction}</CardContent></Card>{academic.courses.length ? <div className="grid gap-4 md:grid-cols-2">{academic.courses.map((course) => <Card key={course.id}><CardHeader><CardTitle>{course.title}</CardTitle><p className="text-sm text-muted-foreground">{course.code}</p></CardHeader><CardContent><Progress value={course.mastery} /><p className="mt-2 text-sm">{course.mastery}% mastery</p></CardContent></Card>)}</div> : <Card><CardContent className="pt-6 text-sm text-muted-foreground">{t("progressNoEvidence")}</CardContent></Card>}<Card><CardHeader><CardTitle>{t("outcomeEvidence")}</CardTitle></CardHeader><CardContent className="space-y-3">{academic.outcomes.map((outcome) => <div className="rounded-md border p-3" key={outcome.id}><p className="font-medium">{outcome.outcomeTitle}</p><p className="text-sm text-muted-foreground">{outcome.courseTitle} · {outcome.assessmentTitle}</p><Progress className="mt-2" value={outcome.percentage} /></div>)}</CardContent></Card></section> : <section className="space-y-4"><Card><CardHeader><CardTitle>{t("careerReadiness")}</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between"><strong className="text-4xl">{readiness.score}%</strong><Badge>{stageLabel[readiness.stage]}</Badge></div><p className="text-sm text-muted-foreground">{readiness.nextAction}</p></CardContent></Card><div className="grid gap-3 md:grid-cols-2">{readiness.factors.map((factor) => <Card key={factor.key}><CardContent className="space-y-2 pt-5"><div className="flex justify-between gap-3"><p className="font-medium">{factor.label}</p><span>{factor.score}% · {factor.weight}%</span></div><Progress value={factor.score} /><p className="text-sm text-muted-foreground">{factor.evidence}</p></CardContent></Card>)}</div></section>}</PageContainer>;
}
