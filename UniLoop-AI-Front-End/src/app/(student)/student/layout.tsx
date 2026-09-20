"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { roleNavigation } from "@/config/navigation";
import { useAuthStore } from "@/features/auth/store";
import { RoleGuard } from "@/features/auth/components/role-guard";

type StudentLayoutProps = { children: ReactNode };

export default function StudentLayout({ children }: StudentLayoutProps) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <RoleGuard expectedRole="STUDENT">{null}</RoleGuard>;
  return (
    <RoleGuard expectedRole="STUDENT">
      <AppShell navigation={roleNavigation.STUDENT} user={user}>
        {children}
      </AppShell>
    </RoleGuard>
  );
}
