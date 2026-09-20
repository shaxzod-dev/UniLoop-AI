import { Label } from "@/components/ui/label";
import { t } from "@/i18n";
import type { Question } from "@/types/assessment";

type AssessmentQuestionProps = {
  question: Question;
  index: number;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
};

export function AssessmentQuestion({
  question,
  index,
  value,
  onChange,
  error,
}: AssessmentQuestionProps) {
  const descriptionId = `question-${question.id}-description`;
  return (
    <fieldset
      aria-describedby={error ? descriptionId : undefined}
      className="rounded-xl border border-border bg-card p-5"
    >
      <legend className="px-1 font-heading text-base font-semibold">
        {t("question")} {index + 1}
      </legend>
      <p className="mt-2 text-sm leading-6">{question.prompt}</p>
      {question.type === "MULTIPLE_CHOICE" ? (
        <div aria-label={t("multipleChoiceLabel")} className="mt-4 grid gap-2">
          {question.options.map((option) => (
            <Label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm hover:bg-muted"
              htmlFor={`${question.id}-${option.id}`}
              key={option.id}
            >
              <input
                checked={value === option.id}
                className="size-4 accent-primary"
                id={`${question.id}-${option.id}`}
                name={question.id}
                onChange={() => onChange(option.id)}
                type="radio"
                value={option.id}
              />
              {option.text}
            </Label>
          ))}
        </div>
      ) : (
        <textarea
          aria-invalid={Boolean(error)}
          aria-label={t("shortAnswerLabel")}
          className="mt-4 min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("shortAnswerLabel")}
          value={value ?? ""}
        />
      )}
      {error ? (
        <p
          className="mt-2 text-sm text-destructive"
          id={descriptionId}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
