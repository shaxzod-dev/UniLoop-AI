import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readinessPresentation } from "@/features/opportunities/presentation";
import { t } from "@/i18n";
import type { CareerProfile, SkillGap } from "@/types/opportunity";

export function ReadinessPanel({
  profile,
  gaps,
}: {
  profile: CareerProfile;
  gaps: SkillGap[];
}) {
  const presentation = readinessPresentation[profile.readinessStage];
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <h2>{t("navCareerReadiness")}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Badge
          className={`whitespace-normal ${presentation.className}`}
          variant="outline"
        >
          {t(presentation.label)}
        </Badge>
        <p className="text-sm leading-6">{t(presentation.explanation)}</p>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium">{t("evidence")}</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {profile.skills.map((skill) => (
              <li key={skill.skillId}>
                {skill.label}: {skill.percentage}%
              </li>
            ))}
          </ul>
        </div>
        {gaps[0] ? (
          <p className="text-sm leading-6">
            <span className="font-medium">{t("missingEvidence")}: </span>
            {gaps[0].requiredEvidence}
          </p>
        ) : null}
        <p className="text-xs leading-5 text-muted-foreground">
          {t("readinessEvidenceNote")}
        </p>
      </CardContent>
    </Card>
  );
}
