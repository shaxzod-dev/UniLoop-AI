import Link from "next/link";
import { ContextState } from "@/components/feedback/context-state";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  evidenceSourcePresentation,
  formatEvidenceDate,
  verificationPresentation,
} from "@/features/opportunities/presentation";
import { t } from "@/i18n";
import type { SkillEvidence } from "@/types/opportunity";

export function SkillEvidenceList({
  skills,
  studentLinks = false,
  headingLevel = 3,
}: {
  skills: SkillEvidence[];
  studentLinks?: boolean;
  headingLevel?: 3 | 4;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  if (!skills.length)
    return (
      <ContextState
        title="noEvidenceTitle"
        description="noEvidenceDescription"
        headingLevel={headingLevel}
      />
    );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {skills.map((skill) => (
        <article
          className="min-w-0 rounded-xl border border-border bg-card p-5"
          key={skill.skillId}
        >
          <Heading className="font-heading font-semibold">
            {skill.label}
          </Heading>
          <div className="mt-3 flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {t("evidenceStrength")}
            </span>
            <strong>{skill.percentage}%</strong>
          </div>
          <Progress
            className="mt-2"
            value={skill.percentage}
            aria-label={`${skill.label}: ${t("evidenceStrength")}`}
            aria-valuenow={skill.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {t("evidenceStrengthNote")}
          </p>
          <ul className="mt-4 space-y-3">
            {skill.sources.map((source) => (
              <li
                className="space-y-1 border-t border-border pt-3 text-xs"
                key={`${source.type}-${source.id}`}
              >
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={
                      evidenceSourcePresentation[source.type].className
                    }
                    variant="outline"
                  >
                    {t(evidenceSourcePresentation[source.type].label)}
                  </Badge>
                  <Badge
                    className={
                      verificationPresentation[source.verification].className
                    }
                    variant="outline"
                  >
                    {t(verificationPresentation[source.verification].label)}
                  </Badge>
                </div>
                {studentLinks && source.type === "ASSESSMENT" ? (
                  <Link
                    className="inline-block min-h-11 py-3 font-medium text-primary underline underline-offset-4"
                    href={`/student/assessments/${source.id}`}
                  >
                    {t("openAssessment")}
                  </Link>
                ) : null}
                <p className="text-muted-foreground">
                  {t("recordedAt")}:{" "}
                  <time dateTime={source.recordedAt}>
                    {formatEvidenceDate(source.recordedAt)}
                  </time>
                </p>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
