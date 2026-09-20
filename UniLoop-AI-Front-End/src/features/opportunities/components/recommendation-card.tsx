"use client";

import { useRef } from "react";
import { Bookmark, Check, ExternalLink, X } from "lucide-react";
import { MutationFeedback } from "@/components/feedback/mutation-feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchingExplanation } from "@/features/opportunities/components/matching-explanation";
import {
  opportunityTypePresentation,
  readinessPresentation,
  recommendationPresentation,
} from "@/features/opportunities/presentation";
import {
  useJoinClub,
  useUpdateRecommendation,
} from "@/features/opportunities/queries";
import { t } from "@/i18n";
import type {
  CareerProfile,
  Recommendation,
  RecommendationStatus,
  SkillGap,
} from "@/types/opportunity";

export function RecommendationCard({
  recommendation,
  profile,
  gaps,
  primary = false,
}: {
  recommendation: Recommendation;
  profile: CareerProfile;
  gaps: SkillGap[];
  primary?: boolean;
}) {
  const update = useUpdateRecommendation();
  const join = useJoinClub();
  const locked = useRef(false);
  const { opportunity } = recommendation;
  const type = opportunityTypePresentation[opportunity.type];
  const status = recommendationPresentation[recommendation.status];
  const skills = new Map(
    [...profile.skills, ...gaps].map((item) => [item.skillId, item.label]),
  );
  const relatedSkills = [...opportunity.skillIds, ...opportunity.gapSkillIds]
    .map((id) => skills.get(id))
    .filter(Boolean);
  const actionable =
    recommendation.status === "NEW" || recommendation.status === "SAVED";
  const career =
    opportunity.type === "INTERNSHIP" || opportunity.type === "JOB";
  const club = opportunity.type === "CLUB";
  function changeStatus(nextStatus: RecommendationStatus) {
    if (locked.current || update.isPending) return;
    locked.current = true;
    update.mutate(
      { recommendationId: recommendation.id, status: nextStatus },
      {
        onSettled: () => {
          locked.current = false;
        },
      },
    );
  }
  return (
    <Card
      className={`min-w-0 h-full ${primary ? "border-primary/30 bg-primary/3 lg:col-span-2" : ""}`}
    >
      <CardHeader>
        {primary ? (
          <p className="text-xs font-semibold text-primary">
            {t("bestConnection")}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Badge className={type.className} variant="outline">
            {t(type.label)}
          </Badge>
          <Badge className={status.className} variant="outline">
            {t(status.label)}
          </Badge>
        </div>
        <CardTitle className="mt-1 leading-6">
          <h3>{opportunity.title}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          {opportunity.description}
        </p>
        <p className="text-xs leading-5">
          <span className="font-medium">{t("relatedSkills")}: </span>
          {[...new Set(relatedSkills)].join(", ") || "—"}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("recommendedGoal")}: {profile.targetRole}
        </p>
        {career ? (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              {t("opportunitySource")}: {opportunity.source ?? t("opportunitySourceUnavailable")}
            </p>
            <p>
              {t("navCareerReadiness")}:{" "}
              {t(readinessPresentation[profile.readinessStage].label)}
            </p>
          </div>
        ) : null}
        {career && opportunity.sourceUrl ? (
          <Button asChild className="min-h-11" variant="outline">
            <a href={opportunity.sourceUrl} rel="noreferrer" target="_blank">
              <ExternalLink aria-hidden="true" />
              HH.uz da ochish
            </a>
          </Button>
        ) : null}
        <MatchingExplanation
          matching={recommendation.matching}
          explanation={recommendation.explanation}
        />
        {actionable ? (
          <div className="flex flex-wrap gap-2">
            {recommendation.status === "NEW" ? (
              <Button
                className="min-h-11"
                aria-label={`${t("actionSave")}: ${opportunity.title}`}
                disabled={update.isPending}
                onClick={() => changeStatus("SAVED")}
                type="button"
                variant="outline"
              >
                <Bookmark aria-hidden="true" />
                {t("actionSave")}
              </Button>
            ) : null}
            {club ? (
              <Button
                className="min-h-11"
                aria-label={`${t("joinClub")}: ${opportunity.title}`}
                disabled={join.isPending}
                onClick={() => join.mutate(opportunity.id)}
                type="button"
              >
                <Check aria-hidden="true" />
                {t("joinClub")}
              </Button>
            ) : (
              <Button
                className="min-h-11"
                aria-label={`${t("acceptRecommendation")}: ${opportunity.title}`}
                disabled={update.isPending}
                onClick={() => changeStatus("ACCEPTED")}
                type="button"
              >
                <Check aria-hidden="true" />
                {t("acceptRecommendation")}
              </Button>
            )}
            <Button
              className="min-h-11"
              aria-label={`${t("dismissRecommendation")}: ${opportunity.title}`}
              disabled={update.isPending}
              onClick={() => changeStatus("DISMISSED")}
              type="button"
              variant="outline"
            >
              <X aria-hidden="true" />
              {t("dismissRecommendation")}
            </Button>
          </div>
        ) : null}
        {club && opportunity.clubMember ? (
          <p className="text-sm text-primary">{t("clubJoined")}</p>
        ) : null}
        <MutationFeedback
          pending={update.isPending}
          error={update.isError}
          success={update.isSuccess}
          successMessage="recommendationUpdated"
        />
        {club ? (
          <MutationFeedback
            error={join.isError}
            pending={join.isPending}
            success={join.isSuccess}
            successMessage="clubJoined"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
