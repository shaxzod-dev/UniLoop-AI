"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { roleNavigation } from "@/config/navigation";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { useAuthStore } from "@/features/auth/store";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <RoleGuard expectedRole="ADMIN">{null}</RoleGuard>;
  return <RoleGuard expectedRole="ADMIN"><AppShell navigation={roleNavigation.ADMIN} user={user}>{children}</AppShell></RoleGuard>;
}
