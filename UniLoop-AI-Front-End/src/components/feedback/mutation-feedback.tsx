import { t, type TranslationKey } from "@/i18n";

export function MutationFeedback({
  pending,
  error,
  success,
  successMessage,
}: {
  pending?: boolean;
  error?: boolean;
  success?: boolean;
  successMessage: TranslationKey;
}) {
  const message = pending
    ? t("mutationSaving")
    : error
      ? t("mutationFailed")
      : success
        ? t(successMessage)
        : "";
  return (
    <p
      aria-live="polite"
      aria-atomic="true"
      className={`min-h-5 text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}
    >
      {message}
    </p>
  );
}
