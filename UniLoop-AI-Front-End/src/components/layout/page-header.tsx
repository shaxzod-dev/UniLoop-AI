"use client";

import { usePathname } from "next/navigation";

import type { NavigationItem } from "@/config/navigation";
import { t } from "@/i18n";

import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { UserMenu } from "@/components/layout/user-menu";
import type { AuthUser } from "@/features/auth/types";

type PageHeaderProps = { navigation: readonly NavigationItem[]; user: AuthUser };

export function PageHeader({ navigation, user }: PageHeaderProps) {
  const pathname = usePathname();
  const activeItem = navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur-sm sm:px-8 lg:px-10"><div className="flex items-center gap-3"><MobileNavigation navigation={navigation} user={user} /><p className="font-heading text-base font-semibold text-[color:var(--navy)]">{activeItem ? t(activeItem.label) : t("navDashboard")}</p></div><UserMenu user={user} /></header>;
}
