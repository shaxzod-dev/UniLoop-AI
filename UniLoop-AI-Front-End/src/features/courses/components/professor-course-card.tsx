"use client";

import Link from "next/link";
import { ArrowRight, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useClassInsight } from "@/features/class-insights/queries";
import { useCourse } from "@/features/courses/queries";
import { useInterventions } from "@/features/interventions/queries";
import { t } from "@/i18n";
import type { CourseSummary } from "@/types/course";

export function ProfessorCourseCard({ course }: { course: CourseSummary }) {
  const detail = useCourse(course.id, "PROFESSOR");
  const insight = useClassInsight(course.id);
  const interventions = useInterventions(course.id);
  const cohort = insight.data?.cohortMasteryPercentage ?? 0;
  const improvement = insight.data?.recentImprovementPercentage;
  const pending =
    interventions.data?.filter((item) => item.status === "SUGGESTED").length ??
    0;
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between gap-3">
          <div>
            <CardTitle>{course.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{course.code}</p>
          </div>
          <UsersRound aria-hidden="true" className="size-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">{t("enrolledStudents")}</p>
            <p className="mt-1 font-semibold">{course.studentCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("assessmentQuestions")}</p>
            <p className="mt-1 font-semibold">
              {detail.data?.assessments.length ?? 0}
            </p>
          </div>
        </div>
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span>{t("cohortMastery")}</span>
            <strong>{cohort}%</strong>
          </div>
          <Progress value={cohort} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {t("recentImprovement")}:{" "}
            {improvement === null || improvement === undefined
              ? "—"
              : `+${improvement}%`}
          </Badge>
          <Badge variant="secondary">
            {t("activeInsights")}: {insight.data?.supportGroups.length ?? 0}
          </Badge>
          <Badge variant="secondary">
            {t("pendingInterventions")}: {pending}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link href={`/professor/courses/${course.id}`}>
            {t("openCourse")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
