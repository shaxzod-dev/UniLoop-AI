"use client";

import { ArrowRight, GraduationCap, Presentation, ShieldCheck, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

import { BrandMark } from "@/components/shared/brand-mark";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardPath } from "@/features/auth/selectors";
import { useAuthStore } from "@/features/auth/store";
import type { UserRole } from "@/features/auth/types";
import { t } from "@/i18n";

const roleCards = [
  { role: "STUDENT", icon: GraduationCap, title: "roleStudent", description: "loginStudentDescription", action: "studentLogin" },
  { role: "PROFESSOR", icon: Presentation, title: "roleProfessor", description: "loginProfessorDescription", action: "professorLogin" },
  { role: "ADMIN", icon: Shield, title: "roleAdmin", description: "loginAdminDescription", action: "adminLogin" },
] as const;

export function DemoLoginPanel() {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const role = useAuthStore((state) => state.role);
  const loginAsRole = useAuthStore((state) => state.loginAsRole);
  const logout = useAuthStore((state) => state.logout);

  function login(roleToUse: UserRole) {
    loginAsRole(roleToUse);
    router.replace(getDashboardPath(roleToUse));
  }

  if (!hydrated) {
    return (
      <main aria-busy="true" aria-live="polite" className="flex min-h-screen items-center justify-center p-5">
        <div className="w-full max-w-5xl space-y-5"><span className="sr-only">{t("loadingSession")}</span><Skeleton className="h-12 w-40" /><Skeleton className="h-96 w-full" /></div>
      </main>
    );
  }

  if (role) {
    return (
      <main className="flex min-h-screen items-center justify-center p-5 sm:p-8">
        <Card className="w-full max-w-lg border border-border shadow-[0_18px_45px_-30px_rgba(15,42,74,0.38)]">
          <CardContent className="space-y-6 pt-0">
            <BrandMark />
            <div><StatusBadge label="demoMode" variant="info" /><h1 className="mt-4 font-heading text-2xl font-semibold text-(--navy)">{t("currentSessionTitle")}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("currentSessionDescription")}</p></div>
            <div className="flex flex-col gap-3 sm:flex-row"><Button className="h-11 flex-1" onClick={() => router.replace(getDashboardPath(role))}>{t("continueCurrentSession")}<ArrowRight aria-hidden="true" data-icon="inline-end" /></Button><Button className="h-11 flex-1" onClick={logout} variant="outline">{t("switchRole")}</Button></div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-5 sm:p-8 lg:p-12">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col justify-center">
        <header className="mb-10 flex items-center justify-between"><BrandMark /><StatusBadge label="demoMode" variant="info" /></header>
        <section aria-labelledby="login-title" className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="max-w-xl"><p className="mb-4 text-sm font-semibold tracking-wide text-primary">{t("loginEyebrow")}</p><h1 className="font-heading text-4xl font-semibold tracking-tight text-(--navy) sm:text-5xl">{t("loginTitle")}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{t("appDescription")}</p><div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950"><ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-700" />{t("demoModeNotice")}</div></div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-3">{roleCards.map(({ role: cardRole, icon: Icon, title, description, action }) => <Card className="min-w-0 border border-border shadow-sm" key={cardRole}><CardContent className="flex h-full min-w-0 flex-col pt-0"><span aria-hidden="true" className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><h2 className="mt-5 font-heading text-xl font-semibold text-(--navy)">{t(title)}</h2><p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{t(description)}</p><Button className="mt-6 h-auto min-h-11 w-full whitespace-normal px-3 py-2 text-center leading-5" onClick={() => login(cardRole)}>{t(action)}<ArrowRight aria-hidden="true" data-icon="inline-end" /></Button></CardContent></Card>)}</div>
        </section>
      </div>
    </main>
  );
}
