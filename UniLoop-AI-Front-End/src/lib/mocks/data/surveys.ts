import { env } from "@/lib/env";
import type { Survey } from "@/types/survey";

export const surveys: Survey[] = [
  {
    id: "survey-student-learning",
    title: "Talabaning o‘qish tajribasi",
    description: "O‘qish jarayoni va rivojlanish ehtiyojlari haqida fikringiz.",
    audience: "STUDENT",
    estimatedMinutes: 5,
    active: true,
    externalUrl: env.studentSurveyUrl ?? null,
  },
  {
    id: "survey-professor-teaching",
    title: "O‘qitish tajribasi",
    description:
      "Guruh bilan ishlash va o‘qitish tavsiyalari haqida fikringiz.",
    audience: "PROFESSOR",
    estimatedMinutes: 6,
    active: true,
    externalUrl: env.professorSurveyUrl ?? null,
  },
];
