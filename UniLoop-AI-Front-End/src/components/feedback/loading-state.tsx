import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/i18n";

export function LoadingState({ cards = 3 }: { cards?: number }) {
  return (
    <section
      aria-busy="true"
      aria-label={t("loadingContent")}
      className="space-y-5"
    >
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-5 w-96 max-w-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <div
            className="space-y-4 rounded-xl border border-border bg-card p-5"
            key={index}
          >
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
    </section>
  );
}
