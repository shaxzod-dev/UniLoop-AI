import type {
  CareerProfile,
  MatchingBreakdown,
  Opportunity,
  SkillGap,
} from "@/types/opportunity";

// These weights rank opportunity relevance only; they never assess a person's worth.
export const matchingWeights = {
  targetRoleAlignment: 0.3,
  demonstratedSkills: 0.25,
  missingSkillRelevance: 0.2,
  collaborationFit: 0.15,
  evidenceStrength: 0.1,
} as const;
export function calculateMatching(
  profile: CareerProfile,
  opportunity: Opportunity,
  gaps: readonly SkillGap[],
): MatchingBreakdown {
  const demonstrated = profile.skills.filter((skill) => skill.percentage >= 70);
  const related = demonstrated.filter((skill) =>
    opportunity.skillIds.includes(skill.skillId),
  );
  const missing = gaps.filter((gap) =>
    opportunity.gapSkillIds.includes(gap.skillId),
  );
  const factors = {
    targetRoleAlignment: opportunity.targetRoleIds.includes(
      profile.targetRoleId,
    )
      ? 100
      : 0,
    demonstratedSkills: opportunity.skillIds.length
      ? Math.round((related.length / opportunity.skillIds.length) * 100)
      : 0,
    missingSkillRelevance: gaps.length
      ? Math.round((missing.length / gaps.length) * 100)
      : 0,
    collaborationFit:
      opportunity.collaborative &&
      missing.some((gap) => gap.skillId === "skill-collaboration")
        ? 100
        : 0,
    evidenceStrength: related.length
      ? Math.round(
          related.reduce((sum, skill) => sum + skill.percentage, 0) /
            related.length,
        )
      : 0,
  };
  const weightedTotal = Math.round(
    Object.entries(matchingWeights).reduce(
      (sum, [key, weight]) =>
        sum + factors[key as keyof typeof factors] * weight,
      0,
    ),
  );
  return { ...factors, weightedTotal };
}
