import { env } from "@/lib/env";
import { t } from "@/i18n";

export const appConfig = {
  name: t("appName"),
  description: t("appDescription"),
  defaultLocale: "uz-Latn",
  apiBaseUrl: env.apiUrl,
  useMocks: env.useMocks,
} as const;
