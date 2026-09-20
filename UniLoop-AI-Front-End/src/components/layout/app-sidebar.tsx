import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrandMark } from "@/components/shared/brand-mark";
import { Separator } from "@/components/ui/separator";
import { NavigationLink } from "@/components/layout/navigation-link";
import type { NavigationItem } from "@/config/navigation";
import type { AuthUser } from "@/features/auth/types";
import { t } from "@/i18n";

type AppSidebarProps = { navigation: readonly NavigationItem[]; user: AuthUser };

export function AppSidebar({ navigation, user }: AppSidebarProps) {
  const roleLabel = user.role === "STUDENT" ? "roleStudent" : user.role === "PROFESSOR" ? "roleProfessor" : "roleAdmin";
  return <aside aria-label={t("sidebarLabel")} className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex"><div className="px-5 py-5"><BrandMark /></div><Separator /><nav aria-label={t("sidebarLabel")} className="flex flex-1 flex-col gap-1 p-3">{navigation.map((item) => <NavigationLink item={item} key={`${item.href}:${item.label}`} />)}</nav><div className="border-t border-border p-4"><div className="flex items-center gap-3"><Avatar size="lg"><AvatarFallback>{user.avatarLabel}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.fullName}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{t(roleLabel)}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{user.university}</p></div></div></div></aside>;
}
