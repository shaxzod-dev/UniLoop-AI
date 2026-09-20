"use client";

import { MessageSquarePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFeedbackInputSchema } from "@/features/feedback/contracts";
import { useCreateFeedback, useMyFeedback } from "@/features/feedback/queries";
import { env } from "@/lib/env";
import type { UserRole } from "@/features/auth/types";

const formSchema = z.object({
  category: createFeedbackInputSchema.shape.category,
  rating: z.string(),
  title: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
  anonymous: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;
const categoryLabels = { BUG: "Xatolik", FEATURE_REQUEST: "Yangi imkoniyat", USABILITY: "Qulaylik", CONTENT: "Mazmun", OTHER: "Boshqa" } as const;
const statusLabels = { NEW: "Yangi", IN_REVIEW: "Ko‘rib chiqilmoqda", PLANNED: "Rejalashtirilgan", RESOLVED: "Hal qilindi" } as const;

export function FeedbackPanel({ role }: { role: UserRole }) {
  const feedback = useMyFeedback(role);
  const create = useCreateFeedback(role);
  const form = useForm<FormValues, unknown, FormValues>({ resolver: zodResolver(formSchema), defaultValues: { category: "USABILITY", rating: "", title: "", message: "", anonymous: false } });
  function submit(values: FormValues) {
    if (env.useMocks || create.isPending) return;
    const parsed = createFeedbackInputSchema.safeParse({ ...values, rating: values.rating ? Number(values.rating) : undefined });
    if (!parsed.success) return;
    create.mutate(parsed.data, { onSuccess: () => form.reset() });
  }
  return <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]" aria-labelledby="feedback-title">
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquarePlus className="size-5 text-primary" aria-hidden="true" /><h2 id="feedback-title">Platforma haqida fikr bildiring</h2></CardTitle></CardHeader><CardContent>
      {env.useMocks ? <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Fikr yuborish haqiqiy API rejimida mavjud. Demo rejimida maʼlumotlar saqlanmaydi.</p> : <form className="space-y-4" onSubmit={form.handleSubmit(submit)} aria-busy={create.isPending}>
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="feedback-category">Kategoriya</Label><select id="feedback-category" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" {...form.register("category")}>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="space-y-2"><Label htmlFor="feedback-rating">Baho (ixtiyoriy)</Label><select id="feedback-rating" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" {...form.register("rating")}><option value="">Tanlanmagan</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></div></div>
        <div className="space-y-2"><Label htmlFor="feedback-title-input">Mavzu</Label><Input id="feedback-title-input" maxLength={120} aria-invalid={!!form.formState.errors.title} {...form.register("title")} />{form.formState.errors.title ? <p className="text-sm text-destructive">Mavzu kamida 3 belgidan iborat bo‘lsin.</p> : null}</div>
        <div className="space-y-2"><Label htmlFor="feedback-message">Xabaringiz</Label><textarea id="feedback-message" className="min-h-28 w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-2 focus-visible:outline-ring" maxLength={2000} aria-invalid={!!form.formState.errors.message} {...form.register("message")} />{form.formState.errors.message ? <p className="text-sm text-destructive">Xabar kamida 10 belgidan iborat bo‘lsin.</p> : null}</div>
        <label className="flex items-start gap-3 text-sm"><input className="mt-1 size-4 accent-primary" type="checkbox" {...form.register("anonymous")} /><span>Fikrimni administratorga anonim ko‘rsating.</span></label>
        {create.isError ? <p role="alert" className="text-sm text-destructive">Fikr yuborilmadi. Qayta urinib ko‘ring.</p> : null}{create.isSuccess ? <p role="status" className="text-sm text-emerald-700">Rahmat, fikringiz saqlandi.</p> : null}
        <Button className="min-h-11" type="submit" disabled={create.isPending}>{create.isPending ? "Yuborilmoqda…" : "Fikrni yuborish"}</Button>
      </form>}
    </CardContent></Card>
    <Card><CardHeader><CardTitle><h2>Mening fikrlarim</h2></CardTitle></CardHeader><CardContent>{feedback.isLoading ? <p className="text-sm text-muted-foreground">Yuklanmoqda…</p> : feedback.isError ? <p className="text-sm text-destructive">Fikrlar yuklanmadi.</p> : !feedback.data?.length ? <p className="text-sm text-muted-foreground">Hali fikr yubormagansiz.</p> : <ul className="space-y-3">{feedback.data.map((item) => <li className="rounded-lg border p-3" key={item.id}><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium">{item.title}</p><span className="text-xs text-muted-foreground">{statusLabels[item.status]}</span></div><p className="mt-1 text-sm text-muted-foreground">{categoryLabels[item.category]}{item.rating ? ` · ${item.rating}/5` : ""}</p></li>)}</ul>}</CardContent></Card>
  </section>;
}
