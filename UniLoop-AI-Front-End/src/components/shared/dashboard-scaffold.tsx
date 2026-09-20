import { CircleCheck } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AuthUser } from "@/features/auth/types";
import type { TranslationKey } from "@/i18n";
import { t } from "@/i18n";

type DashboardScaffoldProps = { user: AuthUser; description: TranslationKey };

export function DashboardScaffold({ user, description }: DashboardScaffoldProps) {
  return <section className="mx-auto max-w-5xl"><p className="text-sm font-semibold tracking-wide text-primary">{t(user.role === "STUDENT" ? "roleStudent" : "roleProfessor")}</p><h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-[color:var(--navy)] sm:text-4xl">{t("welcome")}, {user.fullName}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{t(description)}</p><Card className="mt-8 max-w-xl border border-emerald-200 bg-emerald-50/60 shadow-sm"><CardContent className="flex items-start gap-3 pt-0"><CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-700" /><div><StatusBadge label="demoReady" variant="success" /><p className="mt-3 text-sm leading-6 text-emerald-950">{t("demoReadyDescription")}</p></div></CardContent></Card></section>;
}
