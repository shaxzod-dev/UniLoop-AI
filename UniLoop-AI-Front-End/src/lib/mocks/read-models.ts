import type { MockDatabase } from "@/lib/mocks/database";
import { mean } from "@/lib/mocks/academic-state";
import { calculateMatching } from "@/features/opportunities/matching";
import {
  gaps,
  recommendationExplanation,
  skillLabels,
  evidenceSummary,
} from "@/lib/mocks/data/opportunities";
import type {
  CareerProfile,
  OpportunityDashboard,
  Recommendation,
  SkillGap,
} from "@/types/opportunity";
import type { ClassInsight } from "@/types/class-insight";
import type { ReferralCandidate, StudentEvidence } from "@/types/endorsement";
import { ApiError } from "@/lib/api/errors";

export function required<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
): T {
  const item = items.find(predicate);
  if (!item) throw new ApiError("NOT_FOUND", 404, "apiNotFound");
  return item;
}
export function getProfile(db: MockDatabase, studentId: string): CareerProfile {
  const profile = required(db.profiles, (item) => item.studentId === studentId);
  const mastery = required(
    db.masteries,
    (item) => item.studentId === studentId,
  );
  const sequence = required(mastery.outcomes, (item) =>
    item.outcomeId.endsWith("call-sequence"),
  );
  return {
    ...profile,
    readinessStage:
      mastery.overallPercentage >= 70 ? "PROJECT_READY" : "FOUNDATION",
    skills: [
      {
        skillId: "skill-recursion",
        label: skillLabels["skill-recursion"],
        percentage: mastery.overallPercentage,
        sources: [
          ...new Map(
            mastery.outcomes
              .flatMap((item) => item.evidence)
              .map((item) => [item.id, item]),
          ).values(),
        ],
      },
      {
        skillId: "skill-call-analysis",
        label: skillLabels["skill-call-analysis"],
        percentage: sequence.percentage,
        sources: sequence.evidence,
      },
    ],
  };
}
export function getGaps(db: MockDatabase, studentId: string): SkillGap[] {
  return db.projects.some(
    (item) =>
      item.studentId === studentId &&
      item.collaborative &&
      item.verification === "VERIFIED",
  )
    ? []
    : gaps;
}
export function getRecommendations(
  db: MockDatabase,
  studentId: string,
): Recommendation[] {
  const profile = getProfile(db, studentId);
  const missing = getGaps(db, studentId);
  return db.opportunities
    .filter(
      (item) =>
        (item.type !== "CLUB" ||
          db.clubs.find((club) => club.id === item.id)?.status === "APPROVED") &&
        (item.type !== "PEER" ||
          (profile.consent.peerRecommendations &&
            db.profiles.some(
              (peer) =>
                peer.studentId === item.relatedUserId &&
                peer.consent.discoverable &&
                peer.consent.peerRecommendations,
            ))),
    )
    .map((opportunity) => {
      const id = `recommendation-${opportunity.id}`;
      return {
        id,
        studentId,
        opportunity,
        matching: calculateMatching(profile, opportunity, missing),
        explanation: recommendationExplanation(opportunity.collaborative),
        status: db.recommendationStatuses[id] ?? "NEW",
      };
    })
    .sort(
      (a, b) =>
        b.matching.weightedTotal - a.matching.weightedTotal ||
        a.id.localeCompare(b.id),
    );
}
export function getOpportunityDashboard(
  db: MockDatabase,
  studentId: string,
): OpportunityDashboard {
  return {
    profile: getProfile(db, studentId),
    availableProfessors: db.professors
      .filter((professor) =>
        db.courses.some(
          (course) =>
            course.professorId === professor.id &&
            course.enrollments.some(
              (enrollment) => enrollment.studentId === studentId,
            ),
        ),
      )
      .map(({ id, fullName }) => ({ id, fullName })),
    gaps: getGaps(db, studentId),
    projects: db.projects.filter((item) => item.studentId === studentId),
    recommendations: getRecommendations(db, studentId),
    endorsementRequests: db.endorsements.filter(
      (item) => item.studentId === studentId,
    ),
  };
}
export function getInsight(
  db: MockDatabase,
  courseId: string,
  professorId: string,
): ClassInsight {
  const course = required(
    db.courses,
    (item) => item.id === courseId && item.professorId === professorId,
  );
  const records = db.masteries.filter((item) => item.courseId === course.id);
  const outcomes = course.outcomes.map((outcome) => {
    const entries = records.flatMap((item) =>
      item.outcomes.filter((entry) => entry.outcomeId === outcome.id),
    );
    const completed = entries.filter(
      (item) => item.followUpPercentage !== null,
    );
    return {
      outcomeId: outcome.id,
      diagnosticPercentage: mean(
        entries.flatMap((item) =>
          item.diagnosticPercentage === null ? [] : [item.diagnosticPercentage],
        ),
      ),
      followUpPercentage: completed.length
        ? mean(completed.map((item) => item.followUpPercentage ?? 0))
        : null,
      improvement: completed.length
        ? mean(completed.map((item) => item.change))
        : null,
      followUpStudentCount: completed.length,
      supportStudentIds: records
        .filter((item) =>
          item.outcomes.some(
            (entry) => entry.outcomeId === outcome.id && entry.percentage < 70,
          ),
        )
        .map((item) => item.studentId),
    };
  });
  const diagnostic = required(
    db.assessments,
    (item) => item.courseId === course.id && item.type === "DIAGNOSTIC",
  );
  const submissions = db.submissions.filter(
    (item) => item.assessmentId === diagnostic.id,
  );
  return {
    courseId,
    professorId,
    studentCount: course.studentCount,
    cohortMasteryPercentage: mean(
      outcomes.map(
        (item) => item.followUpPercentage ?? item.diagnosticPercentage,
      ),
    ),
    recentImprovementPercentage: outcomes.some(
      (item) => item.improvement !== null,
    )
      ? mean(
          outcomes.flatMap((item) =>
            item.improvement === null ? [] : [item.improvement],
          ),
        )
      : null,
    outcomes,
    misconceptions: db.misconceptions
      .filter((item) =>
        course.outcomes.some((outcome) => outcome.id === item.outcomeId),
      )
      .map((item) => ({
        misconceptionId: item.id,
        outcomeId: item.outcomeId,
        description: item.description,
        studentIds: records
          .filter((record) =>
            record.outcomes.some((entry) =>
              entry.misconceptionIds.includes(item.id),
            ),
          )
          .map((record) => record.studentId),
      })),
    questionDifficulty: diagnostic.questions.map((question) => {
      const answers = submissions.flatMap((submission) =>
        submission.feedback.filter((item) => item.questionId === question.id),
      );
      const correctCount = answers.filter((item) => item.correct).length;
      return {
        questionId: question.id,
        assessmentId: diagnostic.id,
        correctCount,
        responseCount: answers.length,
        correctPercentage: answers.length
          ? Math.round((correctCount / answers.length) * 100)
          : 0,
        difficultyPercentage: answers.length
          ? Math.round(((answers.length - correctCount) / answers.length) * 100)
          : 0,
      };
    }),
    supportGroups: outcomes
      .filter((item) => item.supportStudentIds.length)
      .map((item) => ({
        id: `support-${item.outcomeId}`,
        outcomeId: item.outcomeId,
        studentIds: item.supportStudentIds,
        reason:
          "Joriy dalillar maqsadli mashq va tushuntirish ehtiyojini ko‘rsatmoqda.",
      })),
    evidenceAssessmentIds: db.assessments
      .filter(
        (item) =>
          item.courseId === courseId &&
          db.submissions.some(
            (submission) => submission.assessmentId === item.id,
          ),
      )
      .map((item) => item.id),
    explanation:
      "Guruh tahlili ayni diagnostika, qayta diagnostika va joriy o‘quv natijalari dalillaridan hisoblandi.",
  };
}
export function getStudentEvidence(
  db: MockDatabase,
  studentId: string,
  professorId: string,
): StudentEvidence {
  const student = required(db.students, (item) => item.id === studentId);
  const requests = db.endorsements.filter(
    (item) =>
      item.studentId === studentId &&
      item.professorId === professorId &&
      item.consentToReview,
  );
  if (!requests.length) throw new ApiError("FORBIDDEN", 403, "apiForbidden");
  const profile = getProfile(db, studentId);
  if (!profile.consent.professorEvidenceReview)
    throw new ApiError("FORBIDDEN", 403, "apiForbidden");
  const visibleCourses = db.courses
    .filter(
      (item) =>
        item.professorId === professorId &&
        item.enrollments.some(
          (enrollment) => enrollment.studentId === studentId,
        ),
    )
    .map((item) => item.id);
  return {
    student,
    targetRole: profile.targetRole,
    readinessStage: profile.readinessStage,
    gaps: getGaps(db, studentId),
    aiSummary: evidenceSummary(
      student.fullName,
      profile.skills,
      getGaps(db, studentId),
    ),
    academic: db.masteries.filter(
      (item) =>
        item.studentId === studentId && visibleCourses.includes(item.courseId),
    ),
    projects: db.projects.filter((item) => item.studentId === studentId),
    technicalSkills: profile.skills,
    collaborationEvidence: db.projects
      .filter((item) => item.studentId === studentId && item.collaborative)
      .map((item) => item.description),
    communicationEvidence: [],
    reviewConsent: true,
    requestIds: requests.map((item) => item.id),
  };
}
export function getReferralCandidates(
  db: MockDatabase,
  professorId: string,
): ReferralCandidate[] {
  return db.endorsements
    .filter(
      (item) =>
        item.professorId === professorId &&
        item.consentToReview &&
        db.profiles.some(
          (profile) =>
            profile.studentId === item.studentId &&
            profile.consent.professorEvidenceReview,
        ),
    )
    .map((request) => ({
      student: required(db.students, (item) => item.id === request.studentId),
      request,
      overallMasteryPercentage: mean(
        getStudentEvidence(db, request.studentId, professorId).academic.map(
          (item) => item.overallPercentage,
        ),
      ),
      readinessStage: getProfile(db, request.studentId).readinessStage,
    }));
}
