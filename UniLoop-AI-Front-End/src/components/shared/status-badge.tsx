import { CircleAlert, CircleCheck, CircleMinus, Info, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { t, type TranslationKey } from "@/i18n";
import { cn } from "@/lib/utils";

const statusDetails = {
  neutral: { label: "statusNeutral", icon: CircleMinus, className: "border-slate-200 bg-slate-100 text-slate-700" },
  info: { label: "statusInfo", icon: Info, className: "border-blue-200 bg-blue-50 text-blue-800" },
  success: { label: "statusSuccess", icon: CircleCheck, className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  warning: { label: "statusWarning", icon: TriangleAlert, className: "border-amber-200 bg-amber-50 text-amber-900" },
  danger: { label: "statusDanger", icon: CircleAlert, className: "border-red-200 bg-red-50 text-red-800" },
} as const;

export type StatusVariant = keyof typeof statusDetails;

type StatusBadgeProps = {
  variant: StatusVariant;
  label?: TranslationKey;
  className?: string;
};

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const { label: defaultLabel, icon: Icon, className: variantClassName } = statusDetails[variant];

  return (
    <Badge className={cn("h-7 gap-1.5 border px-2.5", variantClassName, className)} variant="outline">
      <Icon aria-hidden="true" className="size-3.5" />
      {t(label ?? defaultLabel)}
    </Badge>
  );
}
