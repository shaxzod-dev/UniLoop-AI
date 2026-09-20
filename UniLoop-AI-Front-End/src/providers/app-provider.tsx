"use client";

import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthHydrator } from "@/features/auth/components/auth-hydrator";
import { QueryProvider } from "@/providers/query-provider";

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryProvider>
      <AuthHydrator />
      <TooltipProvider>{children}</TooltipProvider>
    </QueryProvider>
  );
}
