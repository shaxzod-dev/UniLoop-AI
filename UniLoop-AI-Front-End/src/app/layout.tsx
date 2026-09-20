import type { Metadata } from "next";

import { appConfig } from "@/config/app";
import { AppProvider } from "@/providers/app-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: appConfig.name,
    template: `%s | ${appConfig.name}`,
  },
  description: appConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={appConfig.defaultLocale}
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
