"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { login } from "@/features/auth/api";
import { loginInputSchema } from "@/features/auth/contracts";
import { useAuthStore } from "@/features/auth/store";
import { getDashboardPath } from "@/features/auth/selectors";
import { DemoLoginPanel } from "@/features/auth/components/demo-login-panel";
import { env } from "@/lib/env";
import { t } from "@/i18n";
import { ApiError } from "@/lib/api/errors";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
function BackendLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<z.output<typeof loginInputSchema>>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { email: "", password: "" },
  });
  const mutation = useMutation({
    mutationFn: (input: z.output<typeof loginInputSchema>) => login(input),
    onSuccess: (data) => {
      queryClient.clear();
      useAuthStore.getState().setSession(data.accessToken, data.user);
      router.replace(data.user.onboardingCompleted ? getDashboardPath(data.user.role) : "/onboarding");
    },
  });
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <Card className="w-full max-w-md">
          <CardContent className="space-y-6">
          <BrandMark />
            <h1 className="text-2xl font-semibold">{t("loginAccountTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("registerExisting")} <Link className="font-medium text-primary hover:underline" href="/register">{t("registerLoginLink")}</Link></p>
          <form
            className="space-y-4"
            aria-busy={mutation.isPending}
            onSubmit={form.handleSubmit((values) => {
              if (!mutation.isPending) mutation.mutate(values);
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="login-email">{t("loginEmail")}</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="username"
                aria-invalid={!!form.formState.errors.email}
                aria-describedby={
                  form.formState.errors.email ? "login-email-error" : undefined
                }
                {...form.register("email")}
              />
              <p
                id="login-email-error"
                aria-live="polite"
                className="text-sm text-destructive"
              >
                {form.formState.errors.email?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">{t("loginPassword")}</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!form.formState.errors.password}
                aria-describedby={
                  form.formState.errors.password
                    ? "login-password-error"
                    : undefined
                }
                {...form.register("password")}
              />
              <p
                id="login-password-error"
                aria-live="polite"
                className="text-sm text-destructive"
              >
                {form.formState.errors.password?.message}
              </p>
            </div>
            {mutation.isError ? (
              <p role="alert" className="text-sm text-destructive">
                {t(
                  mutation.error instanceof ApiError
                    ? mutation.error.messageKey
                    : "generalError",
                )}
              </p>
            ) : null}
            <Button
              className="w-full min-h-11"
              type="submit"
              disabled={mutation.isPending}
            >
              {t(mutation.isPending ? "loginPending" : "loginSubmit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
export function LoginPanel() {
  return env.useMocks ? <DemoLoginPanel /> : <BackendLogin />;
}
