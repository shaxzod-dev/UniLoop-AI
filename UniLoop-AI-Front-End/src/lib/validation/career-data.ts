import { demoUsers } from "@/features/auth/demo-users";
import type { MockDatabase } from "@/lib/mocks/database";
import {
  getOpportunityDashboard,
  getStudentEvidence,
} from "@/lib/mocks/read-models";
import { opportunityDashboardSchema } from "@/features/opportunities/contracts";
import { evidenceSchema } from "@/features/referrals/contracts";
import { surveySchema } from "@/features/surveys/contracts";
import { skillLabels } from "@/lib/mocks/data/opportunities";
import { ensure } from "@/lib/validation/assertions";

export function validateCareerData(db: MockDatabase): void {
  const students = new Set(db.students.map((item) => item.id));
  const professors = new Set(db.professors.map((item) => item.id));
  const opportunities = new Set(db.opportunities.map((item) => item.id));
  for (const profile of db.profiles)
    ensure(students.has(profile.studentId), "Career profile student reference");
  for (const project of db.projects) {
    ensure(students.has(project.studentId), "Project student reference");
    for (const skillId of project.skillIds)
      ensure(skillId in skillLabels, "Project skill reference");
  }
  for (const opportunity of db.opportunities) {
    ensure(
      opportunity.relatedUserId === null ||
        students.has(opportunity.relatedUserId) ||
        professors.has(opportunity.relatedUserId),
      "Opportunity related user reference",
    );
    for (const skillId of [...opportunity.skillIds, ...opportunity.gapSkillIds])
      ensure(skillId in skillLabels, "Opportunity skill reference");
  }
  for (const endorsement of db.endorsements) {
    ensure(
      students.has(endorsement.studentId) &&
        professors.has(endorsement.professorId) &&
        (endorsement.opportunityId === null ||
          opportunities.has(endorsement.opportunityId)),
      "Endorsement references",
    );
    ensure(
      endorsement.history.length &&
        endorsement.history[endorsement.history.length - 1].status ===
          endorsement.status,
      "Endorsement history consistency",
    );
  }
  for (const survey of db.surveys) surveySchema.parse(survey);
  const dashboard = getOpportunityDashboard(db, demoUsers.STUDENT.id);
  opportunityDashboardSchema.parse(dashboard);
  ensure(
    dashboard.profile.consent.discoverable === false,
    "Demo student should stay private",
  );
  for (const recommendation of dashboard.recommendations)
    ensure(
      opportunities.has(recommendation.opportunity.id),
      "Recommendation opportunity reference",
    );
  for (const id of Object.keys(db.recommendationStatuses))
    ensure(
      db.opportunities.some((item) => id === `recommendation-${item.id}`),
      "Recommendation status reference",
    );
  if (
    dashboard.profile.consent.professorEvidenceReview &&
    db.endorsements.some(
      (item) => item.studentId === demoUsers.STUDENT.id && item.consentToReview,
    )
  ) {
    evidenceSchema.parse(
      getStudentEvidence(db, demoUsers.STUDENT.id, demoUsers.PROFESSOR.id),
    );
  }
}
