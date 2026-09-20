import { Badge } from "@/components/ui/badge";
import { difficultyPresentation } from "@/features/class-insights/presentation";
import { t } from "@/i18n";
import type { Question } from "@/types/assessment";
import type { LearningOutcome } from "@/types/course";
import type { ClassInsight, QuestionDifficulty } from "@/types/class-insight";

interface QuestionDifficultyTableProps {
  items: QuestionDifficulty[];
  misconceptions: ClassInsight["misconceptions"];
  outcomes: LearningOutcome[];
  questions: Question[];
}

export function QuestionDifficultyTable({
  items,
  misconceptions,
  outcomes,
  questions,
}: QuestionDifficultyTableProps) {
  const outcomeNames = new Map(outcomes.map((item) => [item.id, item.title]));
  const questionsById = new Map(questions.map((item) => [item.id, item]));
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={t("questionDifficulty")}
      className="overflow-x-auto rounded-xl border border-border bg-card focus-visible:outline-2 focus-visible:outline-ring"
    >
      <table className="w-full min-w-220 text-left text-sm">
        <caption className="sr-only">{t("questionDifficulty")}</caption>
        <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t("question")}</th>
            <th className="px-4 py-3">{t("affectedOutcome")}</th>
            <th className="px-4 py-3">{t("answeredCorrectly")}</th>
            <th className="px-4 py-3">{t("questionDifficulty")}</th>
            <th className="px-4 py-3">{t("commonMisconception")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const question = questionsById.get(item.questionId);
            const presentation = difficultyPresentation(
              item.difficultyPercentage,
            );
            const misconception = misconceptions.find(
              (entry) => entry.outcomeId === question?.outcomeId,
            );
            return (
              <tr
                className="border-b border-border align-top last:border-0"
                key={item.questionId}
              >
                <td className="px-4 py-3">
                  {t("question")} {index + 1}: {question?.prompt ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {outcomeNames.get(question?.outcomeId ?? "") ??
                    t("learningOutcomes")}
                </td>
                <td className="px-4 py-3">{item.correctPercentage}%</td>
                <td className="px-4 py-3">
                  <Badge className={presentation.className} variant="outline">
                    {t(presentation.label)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {misconception?.description ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
