import {
  diagnostic,
  followUp,
  misconceptions,
} from "@/lib/mocks/data/academic";

export interface GradingRule {
  correctOptionId: string | null;
  acceptedAnswers: string[];
  requiredTerms: string[];
  correctExplanation: string;
  incorrectExplanation: string;
  misconceptionId: string;
}
function createRules(followUpMode: boolean): Record<string, GradingRule> {
  const assessment = followUpMode ? followUp : diagnostic;
  const optionPrefix = followUpMode ? "option-follow-up-" : "option-";
  return Object.fromEntries(
    assessment.questions.map((question, index) => [
      question.id,
      {
        correctOptionId:
          index < 3
            ? optionPrefix +
              ["base-zero", "call-smaller", "sequence-zero"][index]
            : null,
        acceptedAnswers: index === 3 ? ["1", "bir"] : [],
        requiredTerms: index === 4 ? ["to‘xtash", "rekursiv"] : [],
        correctExplanation: [
          "To‘xtash sharti rekursiyani tugatadi.",
          "n - 1 masalani kichraytiradi.",
          "Oxirgi chaqiriq birinchi qaytadi.",
          "Nol faktoriali 1 ga teng.",
          "Ikkala qism ham ko‘rsatilgan.",
        ][index],
        incorrectExplanation: misconceptions[index < 3 ? index : 3].description,
        misconceptionId: misconceptions[index < 3 ? index : 3].id,
      },
    ]),
  );
}
export const gradingRules = { ...createRules(false), ...createRules(true) };
