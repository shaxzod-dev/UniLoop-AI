import type { TranslationKey } from "@/i18n";

export function difficultyPresentation(value: number): {
  label: TranslationKey;
  className: string;
} {
  if (value >= 60)
    return {
      label: "difficultyHigh",
      className: "border-red-200 bg-red-50 text-red-800",
    };
  if (value >= 30)
    return {
      label: "difficultyMedium",
      className: "border-amber-200 bg-amber-50 text-amber-900",
    };
  return {
    label: "difficultyLow",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
}
