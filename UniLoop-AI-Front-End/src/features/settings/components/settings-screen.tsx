"use client";

import { KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/shared/page-container";
import { useAuthStore } from "@/features/auth/store";
import { env } from "@/lib/env";
import { t } from "@/i18n";
import type { UserRole } from "@/features/auth/types";

export function SettingsScreen({ role }: { role: UserRole }) {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const roleLabel =
    role === "STUDENT"
      ? "roleStudent"
      : role === "PROFESSOR"
        ? "roleProfessor"
        : "roleAdmin";

  return (
    <PageContainer className="space-y-6 py-8 sm:py-10">
      <header>
        <p className="text-sm font-medium text-primary">{t("navSettings")}</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          {t("settingsTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("settingsDescription")}
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound aria-hidden="true" className="size-5 text-primary" />
              {t("settingsAccount")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t("settingsName")}</p>
              <p className="mt-1 font-medium">{user?.fullName ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("settingsRole")}</p>
              <p className="mt-1 font-medium">{t(roleLabel)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("settingsProfileId")}</p>
              <p className="mt-1 break-all font-medium">
                {user && "profileId" in user
                  ? user.profileId
                  : (user?.id ?? "-")}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
              {t("settingsSession")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">{t("settingsMode")}</span>
              <Badge variant="outline">
                {env.useMocks ? t("settingsMockMode") : t("settingsRealMode")}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <KeyRound
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              <span>
                {accessToken
                  ? t("settingsTokenActive")
                  : t("settingsTokenMissing")}
              </span>
            </div>
            <p className="text-muted-foreground">{t("settingsSessionNote")}</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
