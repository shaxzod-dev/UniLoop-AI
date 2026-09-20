import { Orbit } from "lucide-react";

import { cn } from "@/lib/utils";
import { t } from "@/i18n";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-xl bg-[color:var(--navy)] text-white shadow-sm"
      >
        <Orbit className="size-5" strokeWidth={2.25} />
      </span>
      <span className="font-heading text-base font-semibold tracking-tight text-[color:var(--navy)]">
        {t("appName")}
      </span>
    </div>
  );
}
