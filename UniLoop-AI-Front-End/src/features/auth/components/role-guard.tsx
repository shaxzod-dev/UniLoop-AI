"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardPath } from "@/features/auth/selectors";
import { useAuthStore } from "@/features/auth/store";
import type { UserRole } from "@/features/auth/types";
import { t } from "@/i18n";

type RoleGuardProps = {
  expectedRole: UserRole;
  children: ReactNode;
};

function SessionLoading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center p-6"
    >
      <div className="w-full max-w-sm space-y-4">
        <span className="sr-only">{t("loadingSession")}</span>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
    </main>
  );
}

export function RoleGuard({ expectedRole, children }: RoleGuardProps) {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Navigation UX only: every protected API enforces JWT, role and ownership server-side.
    if (!hydrated) {
      return;
    }

    if (!role) {
      router.replace("/login");
      return;
    }

    if (user && "onboardingCompleted" in user && !user.onboardingCompleted) {
      router.replace("/onboarding");
      return;
    }
    if (role !== expectedRole) {
      router.replace(getDashboardPath(role));
    }
  }, [expectedRole, hydrated, role, router, user]);

  if (!hydrated || !role || (user && "onboardingCompleted" in user && !user.onboardingCompleted) || role !== expectedRole) {
    return <SessionLoading />;
  }

  return <>{children}</>;
}
