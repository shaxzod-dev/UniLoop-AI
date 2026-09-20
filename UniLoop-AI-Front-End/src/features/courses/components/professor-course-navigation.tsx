"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";

export function ProfessorCourseNavigation({ courseId }: { courseId: string }) {
  const pathname = usePathname();
  const base = `/professor/courses/${courseId}`;
  const items = [
    { href: base, label: "courseOverview" },
    { href: `${base}/assessments`, label: "navAssessments" },
    { href: `${base}/insights`, label: "groupInsights" },
    { href: `${base}/interventions`, label: "teachingRecommendations" },
  ] as const;
  return (
    <nav
      aria-label={t("navCourses")}
      className="mb-6 flex gap-1 overflow-x-auto border-b border-border"
    >
      {items.map((item) => {
        const active =
          item.href === base
            ? pathname === base
            : pathname.startsWith(item.href);
        return (
          <Link
            className={cn(
              "shrink-0 border-b-2 px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground",
              active ? "border-primary text-primary" : "border-transparent",
            )}
            href={item.href}
            key={item.href}
          >
            {t(item.label)}
          </Link>
        );
      })}
    </nav>
  );
}
