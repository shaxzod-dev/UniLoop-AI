import { matchingFactors } from "@/features/opportunities/presentation";
import { t } from "@/i18n";
import type { MatchingBreakdown } from "@/types/opportunity";

export function MatchingExplanation({
  matching,
  explanation,
}: {
  matching: MatchingBreakdown;
  explanation: string;
}) {
  return (
    <details className="rounded-lg border border-border bg-muted/30">
      <summary className="min-h-11 cursor-pointer px-3 py-3 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        {t("matchingExplanation")} · {t("matchingSummary")}:{" "}
        {matching.weightedTotal}%
      </summary>
      <div className="space-y-3 px-3 pb-4">
        <p className="text-sm leading-6 text-muted-foreground">{explanation}</p>
        <dl className="space-y-2">
          {matchingFactors.map((factor) => (
            <div
              className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 text-xs"
              key={factor.key}
            >
              <dt>
                {t(factor.label)}{" "}
                <span className="text-muted-foreground">
                  ({t("factorWeight")}: {factor.weight})
                </span>
              </dt>
              <dd
                className="font-semibold"
                aria-label={`${t(factor.label)}: ${matching[factor.key]}%`}
              >
                {matching[factor.key]}%
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-xs leading-5 text-muted-foreground">
          {t("matchingMethod")}
        </p>
      </div>
    </details>
  );
}
