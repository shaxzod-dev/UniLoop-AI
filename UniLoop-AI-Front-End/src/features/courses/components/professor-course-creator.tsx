"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/shared/page-container";
import { courseAuthoringInputSchema, type CourseAuthoringInput } from "@/features/courses/contracts";
import { createProfessorCourse, updateProfessorCourse } from "@/features/courses/api";
import { useApproveCourseAiSuggestion, useCourseAiSuggestions, usePublishProfessorCourse, useUpdateProfessorCourse } from "@/features/courses/queries";

const steps = ["Asosiy ma’lumotlar", "Maqsadli talabalar", "Learning outcomes", "Modullar va mavzular", "Materiallar", "Assessment", "AI takliflar", "Preview"];
const draftStorageKey = "uniloop-professor-course-draft";
export function ProfessorCourseCreator() {
  const router = useRouter(); const [step, setStep] = useState(0); const [courseId, setCourseId] = useState<string>(); const [savedMessage, setSavedMessage] = useState<string>();
  const form = useForm<CourseAuthoringInput>({ resolver: zodResolver(courseAuthoringInputSchema) as never, defaultValues: { title: "", code: "", description: "", prerequisites: [], targetPrograms: [], outcomes: [], modules: [] } });
  useEffect(() => {
    const saved = window.sessionStorage.getItem(draftStorageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { courseId?: string; values?: unknown };
      const values = courseAuthoringInputSchema.safeParse(parsed.values);
      if (values.success) form.reset(values.data);
      if (parsed.courseId) setCourseId(parsed.courseId);
    } catch { window.sessionStorage.removeItem(draftStorageKey); }
  }, [form]);
  useEffect(() => {
    const subscription = form.watch((values) => window.sessionStorage.setItem(draftStorageKey, JSON.stringify({ courseId, values })));
    return () => subscription.unsubscribe();
  }, [courseId, form]);
  const outcomes = useFieldArray({ control: form.control, name: "outcomes" }); const modules = useFieldArray({ control: form.control, name: "modules" });
  const update = useUpdateProfessorCourse(courseId ?? ""); const ai = useCourseAiSuggestions(courseId ?? ""); const approve = useApproveCourseAiSuggestion(courseId ?? ""); const publish = usePublishProfessorCourse(courseId ?? "");
  const save = async () => {
    const parsed = courseAuthoringInputSchema.safeParse(form.getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "title" || field === "code" || field === "subject" || field === "difficulty" || field === "shortDescription")
          form.setError(field, { message: issue.message });
      }
      form.setError("root", { message: "Kurs nomi va kurs kodini to‘g‘ri kiriting." });
      return;
    }
    form.clearErrors(); setSavedMessage(undefined);
    const values = parsed.data;
    try {
      let savedCourseId = courseId;
      if (!courseId) {
        // POST has a deliberately small creation contract; the complete wizard draft belongs to PATCH.
        const created = await createProfessorCourse({ title: values.title, code: values.code, description: values.description });
        await updateProfessorCourse(created.id, values);
        setCourseId(created.id);
        savedCourseId = created.id;
        window.history.replaceState(null, "", `/professor/courses/${created.id}/edit`);
      } else await update.mutateAsync(values);
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify({ courseId: savedCourseId, values }));
      setSavedMessage("Draft muvaffaqiyatli saqlandi.");
    } catch {
      form.setError("root", { message: "Draft saqlanmadi. Ma’lumotlarni tekshirib, qayta urinib ko‘ring." });
    }
  };
  const applySuggestion = () => {
    const result = ai.data; const suggestion = result?.suggestion; if (!suggestion || !courseId || !result) return;
    form.setValue("shortDescription", suggestion.shortDescription); form.setValue("fullDescription", suggestion.fullDescription); form.setValue("prerequisites", suggestion.prerequisites);
    form.setValue("outcomes", suggestion.outcomes.map(({ statement, description }) => ({ statement, description })));
    form.setValue("modules", suggestion.modules.map(({ title, description, topics }) => ({ title, description, topics: topics.map(({ title: topicTitle, description: topicDescription }) => ({ title: topicTitle, description: topicDescription })) })));
    approve.mutate({ suggestionId: result.id, draft: form.getValues() });
  };
  return <PageContainer className="py-8 sm:py-10"><header className="mb-6"><p className="text-sm font-medium text-primary">Professor kurs yaratish</p><h1 className="font-heading text-3xl font-semibold">Yangi kurs</h1><p className="mt-2 text-sm text-muted-foreground">Har bir AI taklifini tahrirlang va tasdiqlang. Kurs faqat siz publish qilganingizda ochiladi.</p></header>
    <nav aria-label="Kurs yaratish qadamlari" className="mb-5 flex gap-2 overflow-x-auto">{steps.map((label, index) => <Button key={label} onClick={() => setStep(index)} size="sm" type="button" variant={step === index ? "default" : "outline"}>{index + 1}. {label}</Button>)}</nav>
    <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); void save(); }}>
      {(step === 0 || step === 1) && <Card><CardHeader><CardTitle>{steps[step]}</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2"><div><Input aria-label="Kurs nomi" aria-invalid={Boolean(form.formState.errors.title)} placeholder="Kurs nomi" {...form.register("title")} />{form.formState.errors.title?.message ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.title.message}</p> : null}</div><div><Input aria-label="Kurs kodi" aria-invalid={Boolean(form.formState.errors.code)} placeholder="Kurs kodi" {...form.register("code")} />{form.formState.errors.code?.message ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.code.message}</p> : null}</div><Input aria-label="Fan yoki kategoriya" placeholder="Fan yoki kategoriya" {...form.register("subject")} /><Input aria-label="Qiyinlik" placeholder="Qiyinlik" {...form.register("difficulty")} /><Input aria-label="Haftalik yuklama" type="number" placeholder="Haftalik yuklama (soat)" {...form.register("weeklyWorkloadHours", { valueAsNumber: true })} /><textarea aria-label="Qisqa tavsif" className="min-h-24 rounded-md border p-3 md:col-span-2" placeholder="Qisqa tavsif" {...form.register("shortDescription")} /></CardContent></Card>}
      {step === 2 && <Card><CardHeader><CardTitle>Learning outcomes</CardTitle></CardHeader><CardContent className="space-y-3">{outcomes.fields.map((field, index) => <div className="flex gap-2" key={field.id}><Input aria-label={`Natija ${index + 1}`} {...form.register(`outcomes.${index}.statement`)} placeholder="Talaba nima qila oladi?" /><Button onClick={() => outcomes.remove(index)} type="button" variant="outline">Olib tashlash</Button></div>)}<Button onClick={() => outcomes.append({ statement: "", description: "" })} type="button" variant="outline">Natija qo‘shish</Button></CardContent></Card>}
      {step === 3 && <Card><CardHeader><CardTitle>Modullar va mavzular</CardTitle></CardHeader><CardContent className="space-y-3">{modules.fields.map((field, index) => <div className="flex gap-2" key={field.id}><Input aria-label={`Modul ${index + 1}`} {...form.register(`modules.${index}.title`)} placeholder="Modul nomi" /><Button onClick={() => modules.remove(index)} type="button" variant="outline">Olib tashlash</Button></div>)}<Button onClick={() => modules.append({ title: "", description: "", topics: [] })} type="button" variant="outline">Modul qo‘shish</Button></CardContent></Card>}
      {(step === 4 || step === 5) && <Card><CardHeader><CardTitle>{steps[step]}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Kurs saqlangach, mavjud material va assessment boshqaruvlarida bog‘langan materiallar, savollar va baholashlarni qo‘shing.</p></CardContent></Card>}
      {step === 6 && <Card><CardHeader><CardTitle>AI takliflar</CardTitle></CardHeader><CardContent className="space-y-3"><Button disabled={!courseId || ai.isPending} onClick={() => ai.mutate("Kurs tuzilmasini takomillashtir")} type="button">AI yordamida taklif yaratish</Button>{ai.data && <div className="rounded-md border p-3 text-sm"><p>{ai.data.suggestion.shortDescription}</p><p className="mt-2">{ai.data.fallback ? "Deterministik fallback taklifi" : "AI taklifi"}; tahrirlab tasdiqlang.</p><Button className="mt-3" disabled={approve.isPending} onClick={applySuggestion} type="button" variant="outline">Taklifni qabul qilish</Button></div>}</CardContent></Card>}
      {step === 7 && <Card><CardHeader><CardTitle>Preview va publish</CardTitle></CardHeader><CardContent><h2 className="font-semibold">{form.watch("title") || "Kurs nomi"}</h2><p className="mt-2 text-sm text-muted-foreground">{form.watch("shortDescription")}</p><p className="mt-3 text-sm">{form.watch("outcomes").length} ta natija, {form.watch("modules").length} ta modul.</p></CardContent></Card>}
      {form.formState.errors.root?.message ? <p aria-live="polite" className="text-sm text-destructive">{form.formState.errors.root.message}</p> : null}
      {savedMessage ? <p aria-live="polite" className="text-sm text-emerald-700">{savedMessage}</p> : null}
      <div className="flex flex-wrap gap-2"><Button disabled={update.isPending} type="submit">Draft saqlash</Button><Button disabled={!courseId || publish.isPending} onClick={() => publish.mutate(undefined, { onSuccess: () => router.push(`/professor/courses/${courseId}`) })} type="button" variant="outline">Publish qilish</Button></div>
    </form></PageContainer>;
}
