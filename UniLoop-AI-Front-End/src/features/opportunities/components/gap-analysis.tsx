import { ContextState } from "@/components/feedback/context-state";
import { t } from "@/i18n";
import type { SkillGap } from "@/types/opportunity";

export function GapAnalysis({
  gaps,
  headingLevel = 3,
}: {
  gaps: SkillGap[];
  headingLevel?: 3 | 4;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  if (!gaps.length)
    return (
      <ContextState
        title="noGapsTitle"
        description="noGapsDescription"
        headingLevel={headingLevel}
      />
    );
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {gaps.map((gap) => (
        <article
          className="rounded-xl border border-amber-200 bg-amber-50/50 p-5"
          key={gap.skillId}
        >
          <Heading className="font-heading font-semibold">{gap.label}</Heading>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {gap.reason}
          </p>
          <p className="mt-3 text-sm">
            <span className="font-medium">{t("requiredEvidence")}: </span>
            {gap.requiredEvidence}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("nextAction")}: {t("gatherEvidenceNextStep")}
          </p>
        </article>
      ))}
    </div>
  );
}
