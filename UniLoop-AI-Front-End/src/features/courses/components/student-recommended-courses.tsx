"use client";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { useRecommendedCourses, useRequestEnrollment } from "@/features/courses/queries";

export function StudentRecommendedCourses() {
  const recommendations = useRecommendedCourses();
  if (recommendations.isLoading) return <PageContainer className="py-8"><LoadingState cards={3} /></PageContainer>;
  if (recommendations.isError) return <PageContainer className="py-8"><ErrorState retry={() => void recommendations.refetch()} /></PageContainer>;
  return <PageContainer className="py-8 sm:py-10"><header className="mb-6"><p className="text-sm font-medium text-primary">Siz uchun</p><h1 className="font-heading text-3xl font-semibold">Tavsiya etilgan kurslar</h1></header><div className="grid gap-4 md:grid-cols-2">{recommendations.data?.map((item) => <RecommendedCard item={item} key={item.course.id} />)}</div></PageContainer>;
}
function RecommendedCard({ item }: { item: NonNullable<ReturnType<typeof useRecommendedCourses>["data"]>[number] }) {
  const enroll = useRequestEnrollment(item.course.id);
  return <Card><CardHeader><div className="flex justify-between gap-3"><CardTitle>{item.course.title}</CardTitle><strong>{item.matchScore}% mos</strong></div><p className="text-sm text-muted-foreground">{item.course.shortDescription}</p></CardHeader><CardContent><p className="mb-2 text-sm font-medium">Nega tavsiya qilindi</p><ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{item.matchFactors.map((factor) => <li key={factor}>{factor}</li>)}</ul>{item.course.prerequisites.length ? <p className="mb-4 text-sm">Prerequisites: {item.course.prerequisites.join(", ")}</p> : null}<div className="flex gap-2"><Button asChild size="sm" variant="outline"><Link href={`/student/courses/${item.course.id}`}>Batafsil</Link></Button><Button disabled={!item.mayEnroll || enroll.isPending} onClick={() => enroll.mutate()} size="sm">{item.professorApprovalRequired ? "So‘rov yuborish" : "Qo‘shilish"}</Button></div></CardContent></Card>;
}
