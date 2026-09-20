"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { roleNavigation } from "@/config/navigation";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { useAuthStore } from "@/features/auth/store";

type ProfessorLayoutProps = { children: ReactNode };

export default function ProfessorLayout({ children }: ProfessorLayoutProps) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <RoleGuard expectedRole="PROFESSOR">{null}</RoleGuard>;
  return (
    <RoleGuard expectedRole="PROFESSOR">
      <AppShell navigation={roleNavigation.PROFESSOR} user={user}>
        {children}
      </AppShell>
    </RoleGuard>
  );
}
