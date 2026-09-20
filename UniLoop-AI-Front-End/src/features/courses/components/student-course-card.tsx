"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourse } from "@/features/courses/queries";
import { useMastery } from "@/features/mastery/queries";
import {
  formatMasteryPercentage,
  masteryPresentation,
} from "@/features/mastery/presentation";
import { Badge } from "@/components/ui/badge";
import { t } from "@/i18n";
import type { CourseSummary } from "@/types/course";

export function StudentCourseCard({ course }: { course: CourseSummary }) {
  // Course lists already contain summaries. The full course and mastery
  // payloads are requested by the detail page after the student opens it.
  // Keeping the hooks disabled here prevents two network requests per card.
  const detail = useCourse(course.id, "STUDENT", false);
  const mastery = useMastery(course.id, false);
  const current = mastery.data;
  const assessed = current?.outcomes.filter(
    (outcome) => outcome.evidence.length,
  );
  const level = assessed?.length
    ? assessed.reduce((lowest, item) =>
        item.percentage < lowest.percentage ? item : lowest,
      ).level
    : null;
  const nextAssessment =
    detail.data?.assessments.find((item) => item.type === "DIAGNOSTIC") ??
    detail.data?.assessments[0];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{course.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{course.code}</p>
          </div>
          <BookOpen aria-hidden="true" className="size-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {detail.data?.professor.fullName ?? t("loading")}
        </p>
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>{t("overallMastery")}</span>
            <strong>{formatMasteryPercentage(current)}</strong>
          </div>
          <Progress
            aria-label={t("accessibilityProgress")}
            value={current?.overallPercentage ?? 0}
          />
        </div>
        {level ? (
          <Badge
            className={masteryPresentation[level].className}
            variant="outline"
          >
            {t(masteryPresentation[level].label)}
          </Badge>
        ) : null}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">{t("completedAssessments")}</p>
            <p className="mt-1 font-medium">
              {detail.data?.assessments.reduce(
                (sum, assessment) => sum + (assessment.submissionCount ?? 0),
                0,
              ) ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("nextAction")}</p>
            <p className="mt-1 font-medium">{nextAssessment?.title ?? "—"}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link href={`/student/courses/${course.id}`}>
            {t("openCourse")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
