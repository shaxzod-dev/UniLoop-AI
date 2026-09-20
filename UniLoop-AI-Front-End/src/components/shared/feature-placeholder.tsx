import { BookOpenCheck, ClipboardList, Compass, ListChecks, Send, type LucideIcon } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TranslationKey } from "@/i18n";
import { t } from "@/i18n";

type PlaceholderIcon = "courses" | "opportunities" | "referrals" | "growthPlan" | "surveys";

const placeholderIcons: Record<PlaceholderIcon, LucideIcon> = {
  courses: BookOpenCheck,
  opportunities: Compass,
  referrals: Send,
  growthPlan: ListChecks,
  surveys: ClipboardList,
};

type FeaturePlaceholderProps = { title: TranslationKey; description: TranslationKey; icon: PlaceholderIcon; statusLabel?: TranslationKey };

export function FeaturePlaceholder({ title, description, icon, statusLabel = "preparing" }: FeaturePlaceholderProps) {
  const Icon = placeholderIcons[icon];
  return <section className="mx-auto max-w-3xl"><Card className="border border-border shadow-sm"><CardContent className="pt-0"><span aria-hidden="true" className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-6" /></span><StatusBadge className="mt-6" label={statusLabel} variant="info" /><h1 className="mt-4 font-heading text-2xl font-semibold text-[color:var(--navy)] sm:text-3xl">{t(title)}</h1><p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">{t(description)}</p></CardContent></Card></section>;
}
