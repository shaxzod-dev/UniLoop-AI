import type { ReactNode } from "react";
import { t, type TranslationKey } from "@/i18n";

export function ContextState({
  title,
  description,
  children,
  headingLevel = 3,
}: {
  title: TranslationKey;
  description: TranslationKey;
  children?: ReactNode;
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = headingLevel === 2 ? "h2" : headingLevel === 3 ? "h3" : "h4";
  return (
    <section className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
      <Heading className="font-heading text-base font-semibold">
        {t(title)}
      </Heading>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t(description)}
      </p>
      {children}
    </section>
  );
}
