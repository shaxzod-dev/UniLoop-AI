"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth/store";
import type { AuthUser } from "@/features/auth/types";
import { t } from "@/i18n";

type UserMenuProps = { user: AuthUser };

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const roleLabel = user.role === "STUDENT" ? "roleStudent" : "roleProfessor";
  function handleLogout() { queryClient.clear(); logout(); router.replace("/login"); }
  return <DropdownMenu><DropdownMenuTrigger asChild><Button aria-label={t("userMenuLabel")} className="size-10 rounded-full" size="icon" variant="ghost"><Avatar><AvatarFallback>{user.avatarLabel}</AvatarFallback></Avatar></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-64"><DropdownMenuLabel><p className="text-sm font-semibold text-foreground">{user.fullName}</p><p className="mt-1 text-xs font-normal text-muted-foreground">{t(roleLabel)}</p><p className="mt-1 text-xs font-normal text-muted-foreground">{user.faculty}</p></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onSelect={handleLogout} variant="destructive"><LogOut aria-hidden="true" />{t("logout")}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
}
