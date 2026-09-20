"use client";

import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { NavigationLink } from "@/components/layout/navigation-link";
import { BrandMark } from "@/components/shared/brand-mark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { NavigationItem } from "@/config/navigation";
import { useAuthStore } from "@/features/auth/store";
import type { AuthUser } from "@/features/auth/types";
import { t } from "@/i18n";

type MobileNavigationProps = { navigation: readonly NavigationItem[]; user: AuthUser };

export function MobileNavigation({ navigation, user }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const roleLabel = user.role === "STUDENT" ? "roleStudent" : "roleProfessor";
  function handleLogout() { queryClient.clear(); logout(); setOpen(false); router.replace("/login"); }
  return <Sheet onOpenChange={setOpen} open={open}><SheetTrigger asChild><Button aria-label={t("mobileMenuLabel")} className="lg:hidden" size="icon" variant="outline"><Menu aria-hidden="true" /></Button></SheetTrigger><SheetContent className="w-[min(88vw,20rem)] p-0" showCloseButton={false} side="left"><SheetHeader className="flex-row items-center justify-between border-b border-border p-4"><div><SheetTitle><BrandMark /></SheetTitle><SheetDescription className="sr-only">{t("mobileMenuDescription")}</SheetDescription></div><SheetClose asChild><Button aria-label={t("closeMenuLabel")} size="icon" variant="ghost"><X aria-hidden="true" /></Button></SheetClose></SheetHeader><nav aria-label={t("mobileMenuLabel")} className="flex flex-1 flex-col gap-1 p-3">{navigation.map((item) => <NavigationLink item={item} key={`${item.href}:${item.label}`} onNavigate={() => setOpen(false)} />)}</nav><div className="border-t border-border p-4"><div className="flex items-center gap-3"><Avatar><AvatarFallback>{user.avatarLabel}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.fullName}</p><p className="text-xs text-muted-foreground">{t(roleLabel)}</p></div></div><Button className="mt-4 h-10 w-full" onClick={handleLogout} variant="outline">{t("logout")}</Button></div></SheetContent></Sheet>;
}
