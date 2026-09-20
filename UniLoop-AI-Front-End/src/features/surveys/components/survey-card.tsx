import { ExternalLink, FileQuestion, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { surveyAudiencePresentation } from "@/features/surveys/presentation";
import { t } from "@/i18n";
import type { Survey } from "@/types/survey";

export function SurveyCard({ survey }: { survey: Survey }) {
  const audience = surveyAudiencePresentation[survey.audience];
  const available = survey.active && Boolean(survey.externalUrl);
  return (
    <Card className="h-full border-border">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
          >
            <FileQuestion className="size-5" />
          </span>
          <Badge
            className={
              survey.active
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }
            variant="outline"
          >
            {survey.active
              ? t("surveyStatusActive")
              : t("surveyStatusInactive")}
          </Badge>
        </div>
        <CardTitle className="mt-4 leading-6">
          <h2>{survey.title}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          {survey.description}
        </p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("surveyAudienceLabel")}
            </dt>
            <dd className="mt-1 font-medium">{t(audience.label)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("surveyEstimatedTime")}
            </dt>
            <dd className="mt-1 flex items-center gap-1 font-medium">
              <Timer aria-hidden="true" className="size-4 text-primary" />
              {survey.estimatedMinutes} {t("surveyMinutes")}
            </dd>
          </div>
        </dl>
        {!survey.active ? (
          <p className="rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-950">
            {t("surveyInactiveDescription")}
          </p>
        ) : null}
        {survey.active && !survey.externalUrl ? (
          <p className="rounded-lg bg-muted/60 p-3 text-sm leading-6 text-muted-foreground">
            {t("surveyUnavailable")}
          </p>
        ) : null}
      </CardContent>
      <CardFooter>
        {available ? (
          <Button asChild className="min-h-11 w-full" size="lg">
            <a
              aria-label={`${t("startSurvey")}: ${survey.title}. ${t("openExternalForm")}`}
              href={survey.externalUrl ?? undefined}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("startSurvey")}
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        ) : (
          <Button className="min-h-11 w-full" disabled size="lg" type="button">
            {t("surveyUnavailable")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
