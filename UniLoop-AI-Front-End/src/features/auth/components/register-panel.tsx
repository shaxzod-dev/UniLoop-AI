"use client";

import { Eye, EyeOff, GraduationCap, Presentation } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/features/auth/api";
import { getDashboardPath } from "@/features/auth/selectors";
import { useAuthStore } from "@/features/auth/store";
import { registerInputSchema } from "@/features/auth/contracts";
import { ApiError } from "@/lib/api/errors";
import { env } from "@/lib/env";
import { t } from "@/i18n";

const formSchema = registerInputSchema.extend({
  confirmPassword: z.string().min(1, t("registerPasswordMismatch")),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: t("registerPasswordMismatch"),
});
type FormValues = z.infer<typeof formSchema>;

export function RegisterPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const loginAsRole = useAuthStore((state) => state.loginAsRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "STUDENT" },
  });
  const mutation = useMutation({
    mutationFn: (values: FormValues) => register({ name: values.name, email: values.email, password: values.password, role: values.role }),
    onSuccess: (data) => {
      queryClient.clear();
      useAuthStore.getState().setSession(data.accessToken, data.user);
      router.replace("/onboarding");
    },
  });

  function submit(values: FormValues) {
    if (env.useMocks) {
      queryClient.clear();
      loginAsRole(values.role);
      router.replace(getDashboardPath(values.role));
      return;
    }
    if (!mutation.isPending) mutation.mutate(values);
  }

  const role = useWatch({ control: form.control, name: "role" });
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(21,101,192,0.12),transparent_35%),#f7fafc] p-5 sm:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-2xl border-border/80 shadow-[0_24px_80px_-42px_rgba(15,42,74,0.55)]">
          <CardContent className="space-y-7 pt-0">
            <div className="flex items-center justify-between gap-4"><BrandMark /><Link className="text-sm font-medium text-primary hover:underline" href="/login">{t("registerLoginLink")}</Link></div>
            <div><p className="text-sm font-semibold text-primary">UniLoop AI</p><h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-[color:var(--navy)]">{t("registerTitle")}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{t("registerDescription")}</p></div>
            {env.useMocks ? <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">{t("registerMockNotice")}</p> : null}
            <form className="space-y-5" onSubmit={form.handleSubmit(submit)} aria-busy={mutation.isPending}>
              <div className="space-y-2"><Label htmlFor="register-name">{t("registerName")}</Label><Input id="register-name" autoComplete="name" aria-invalid={!!form.formState.errors.name} {...form.register("name")} />{form.formState.errors.name ? <p className="text-sm text-destructive">{form.formState.errors.name.message ?? t("registerNameInvalid")}</p> : null}</div>
              <div className="space-y-2"><Label htmlFor="register-email">{t("loginEmail")}</Label><Input id="register-email" type="email" autoComplete="email" aria-invalid={!!form.formState.errors.email} {...form.register("email")} />{form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}</div>
              <fieldset className="space-y-2"><legend className="text-sm font-medium">{t("registerRole")}</legend><div className="grid gap-3 sm:grid-cols-2">{([{ value: "STUDENT", label: t("registerStudent"), Icon: GraduationCap }, { value: "PROFESSOR", label: t("registerProfessor"), Icon: Presentation }] as const).map(({ value, label, Icon }) => <button key={value} type="button" aria-pressed={role === value} onClick={() => form.setValue("role", value, { shouldValidate: true })} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${role === value ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"}`}><Icon className="size-5 text-primary" aria-hidden="true" /><span className="font-medium">{label}</span></button>)}</div></fieldset>
              <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="register-password">{t("loginPassword")}</Label><div className="relative"><Input id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" className="pr-11" {...form.register("password")} /><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground" aria-label={showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>{form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}</div><div className="space-y-2"><Label htmlFor="register-confirm">{t("registerPasswordConfirm")}</Label><div className="relative"><Input id="register-confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password" className="pr-11" {...form.register("confirmPassword")} /><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground" aria-label={showConfirm ? "Parolni yashirish" : "Parolni ko‘rsatish"} onClick={() => setShowConfirm((value) => !value)}>{showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>{form.formState.errors.confirmPassword ? <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p> : null}</div></div>
              {mutation.isError ? <p role="alert" className="text-sm text-destructive">{mutation.error instanceof ApiError ? t(mutation.error.messageKey) : t("generalError")}</p> : null}
              <Button className="h-11 w-full" type="submit" disabled={mutation.isPending}>{mutation.isPending ? t("registerPending") : t("registerSubmit")}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
