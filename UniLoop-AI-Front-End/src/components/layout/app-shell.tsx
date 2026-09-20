"use client";

import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageHeader } from "@/components/layout/page-header";
import type { NavigationItem } from "@/config/navigation";
import type { AuthUser } from "@/features/auth/types";
import { t } from "@/i18n";

type AppShellProps = { navigation: readonly NavigationItem[]; user: AuthUser; children: ReactNode };

export function AppShell({ navigation, user, children }: AppShellProps) {
  return <div className="flex min-h-screen"><a className="sr-only fixed left-4 top-4 z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only" href="#main-content">{t("skipToContent")}</a><AppSidebar navigation={navigation} user={user} /><div className="flex min-w-0 flex-1 flex-col"><PageHeader navigation={navigation} user={user} /><main className="flex-1 p-5 sm:p-8 lg:p-10" id="main-content" tabIndex={-1}>{children}</main></div></div>;
}
