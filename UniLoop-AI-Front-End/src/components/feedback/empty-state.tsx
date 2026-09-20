import { Inbox } from "lucide-react";
import { t } from "@/i18n";

export function EmptyState({
  title = "emptyTitle",
  description = "emptyDescription",
}: {
  title?: "emptyTitle";
  description?: "emptyDescription";
}) {
  return (
    <section className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <Inbox
        aria-hidden="true"
        className="mx-auto mb-3 size-6 text-muted-foreground"
      />
      <h1 className="font-heading text-lg font-semibold">{t(title)}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {t(description)}
      </p>
    </section>
  );
}
