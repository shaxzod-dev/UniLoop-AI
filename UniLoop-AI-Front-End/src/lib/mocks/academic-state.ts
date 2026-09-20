import type {
  Assessment,
  QuestionFeedback,
  StudentAnswer,
} from "@/types/assessment";
import type { MasteryLevel, MasterySummary } from "@/types/mastery";
import type { GradingRule } from "@/lib/mocks/data/grading";
import { seedTimestamp } from "@/lib/mocks/data/academic";

export function masteryLevel(percentage: number): MasteryLevel {
  if (percentage < 50) return "NEEDS_SUPPORT";
  if (percentage < 70) return "DEVELOPING";
  if (percentage < 85) return "PROFICIENT";
  return "MASTERED";
}
export function mean(values: readonly number[]): number {
  return values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : 0;
}
export function gradeAnswers(
  assessment: Assessment,
  answers: StudentAnswer[],
  rules: Record<string, GradingRule>,
): QuestionFeedback[] {
  return assessment.questions.map((question) => {
    const rule = rules[question.id];
    const answer = answers.find((item) => item.questionId === question.id);
    const text = (answer?.text ?? "")
      .toLocaleLowerCase("uz")
      .replace(/[’'ʻ]/g, "‘")
      .trim();
    const correct =
      question.type === "MULTIPLE_CHOICE"
        ? answer?.optionId === rule.correctOptionId
        : rule.acceptedAnswers.includes(text) ||
          (rule.requiredTerms.length > 0 &&
            rule.requiredTerms.every((term) => text.includes(term)));
    return {
      questionId: question.id,
      outcomeId: question.outcomeId,
      correct,
      correctAnswer:
        question.type === "MULTIPLE_CHOICE"
          ? (question.options.find((item) => item.id === rule.correctOptionId)
              ?.text ?? "")
          : (rule.acceptedAnswers[0] ?? rule.requiredTerms.join(" va ")),
      explanation: correct
        ? rule.correctExplanation
        : rule.incorrectExplanation,
      misconceptionId: correct ? null : rule.misconceptionId,
      misconception: correct ? null : rule.incorrectExplanation,
    };
  });
}
export function outcomePercentages(
  assessment: Assessment,
  feedback: QuestionFeedback[],
): Map<string, number> {
  return new Map(
    [
      ...new Set(assessment.questions.map((question) => question.outcomeId)),
    ].map((outcomeId) => [
      outcomeId,
      mean(
        feedback
          .filter((item) => item.outcomeId === outcomeId)
          .map((item) =>
            item.correct
              ? assessment.type === "DIAGNOSTIC"
                ? 85
                : 90
              : assessment.type === "DIAGNOSTIC"
                ? 35
                : 55,
          ),
      ),
    ]),
  );
}
export function createMastery(
  studentId: string,
  diagnostic: Assessment,
  feedback: QuestionFeedback[],
  followUp?: Assessment,
): MasterySummary {
  const percentages = outcomePercentages(diagnostic, feedback);
  const outcomes = [...percentages].map(
    ([outcomeId, diagnosticPercentage]) => ({
      outcomeId,
      diagnosticPercentage,
      percentage: followUp ? 90 : diagnosticPercentage,
      followUpPercentage: followUp ? 90 : null,
      change: followUp ? 90 - diagnosticPercentage : 0,
      level: masteryLevel(followUp ? 90 : diagnosticPercentage),
      evidence: [
        {
          id: diagnostic.id,
          type: "ASSESSMENT" as const,
          verification: "UNVERIFIED" as const,
          recordedAt: seedTimestamp,
        },
        ...(followUp
          ? [
              {
                id: followUp.id,
                type: "ASSESSMENT" as const,
                verification: "UNVERIFIED" as const,
                recordedAt: seedTimestamp,
              },
            ]
          : []),
      ],
      misconceptionIds: followUp
        ? []
        : [
            ...new Set(
              feedback
                .filter(
                  (item) =>
                    item.outcomeId === outcomeId && item.misconceptionId,
                )
                .flatMap((item) =>
                  item.misconceptionId ? [item.misconceptionId] : [],
                ),
            ),
          ],
      nextAction:
        (followUp ? 90 : diagnosticPercentage) < 70
          ? "Chaqiriqlarni bosqichma-bosqich kuzatish mashqini bajaring."
          : "Ko‘nikmani loyiha orqali mustahkamlang.",
    }),
  );
  return {
    courseId: diagnostic.courseId,
    studentId,
    overallPercentage: mean(outcomes.map((item) => item.percentage)),
    outcomes,
  };
}
