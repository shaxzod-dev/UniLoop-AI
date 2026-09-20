import { demoUsers } from "@/features/auth/demo-users";
import { mean, outcomePercentages } from "@/lib/mocks/academic-state";
import type { MockDatabase } from "@/lib/mocks/database";
import { getInsight } from "@/lib/mocks/read-models";
import { insightSchema } from "@/features/class-insights/contracts";
import { masterySchema } from "@/features/mastery/contracts";
import { ensure, idSet } from "@/lib/validation/assertions";

export function validateAcademicData(db: MockDatabase): void {
  ensure(
    db.students.length === 10 && db.professors.length === 1,
    "Expected ten students and one professor",
  );
  ensure(
    db.students[0].id === demoUsers.STUDENT.id &&
      db.students[0].fullName === demoUsers.STUDENT.fullName &&
      db.students[0].university === demoUsers.STUDENT.university &&
      db.students[0].faculty === demoUsers.STUDENT.faculty,
    "Student demo identity drift",
  );
  ensure(
    db.professors[0].id === demoUsers.PROFESSOR.id &&
      db.professors[0].fullName === demoUsers.PROFESSOR.fullName &&
      db.professors[0].university === demoUsers.PROFESSOR.university &&
      db.professors[0].faculty === demoUsers.PROFESSOR.faculty,
    "Professor demo identity drift",
  );
  const universities = idSet(db.universities, "university");
  const faculties = idSet(db.faculties, "faculty");
  const students = idSet(db.students, "student");
  const professors = idSet(db.professors, "professor");
  const courses = idSet(db.courses, "course");
  const outcomes = idSet(
    db.courses.flatMap((item) => item.outcomes),
    "outcome",
  );
  const assessments = idSet(db.assessments, "assessment");
  const questions = idSet(
    db.assessments.flatMap((item) => item.questions),
    "question",
  );
  const misconceptions = idSet(db.misconceptions, "misconception");
  const projects = idSet(db.projects, "project");
  idSet(db.opportunities, "opportunity");
  idSet(
    db.assessments.flatMap((item) =>
      item.questions.flatMap((question) => question.options),
    ),
    "option",
  );
  idSet(
    db.courses.flatMap((item) => item.materials),
    "material",
  );
  idSet(db.submissions, "submission");
  idSet(db.learningPlans, "learning plan");
  idSet(
    db.learningPlans.flatMap((item) => item.tasks),
    "learning task",
  );
  idSet(db.interventions, "intervention");
  idSet(db.endorsements, "endorsement");
  idSet(db.surveys, "survey");
  for (const faculty of db.faculties)
    ensure(
      faculty.universityId !== null && universities.has(faculty.universityId),
      "Faculty university reference",
    );
  for (const user of [...db.students, ...db.professors]) {
    ensure(
      user.universityId !== null &&
        user.facultyId !== null &&
        universities.has(user.universityId) &&
        faculties.has(user.facultyId),
      "User organization reference",
    );
    const faculty = db.faculties.find((item) => item.id === user.facultyId);
    ensure(
      faculty?.universityId === user.universityId &&
        faculty.name === user.faculty &&
        db.universities.find((item) => item.id === user.universityId)?.name ===
          user.university,
      "Organization names must match identity",
    );
  }
  for (const course of db.courses) {
    ensure(
      professors.has(course.professorId) &&
        course.professor.id === course.professorId,
      "Course professor reference",
    );
    ensure(
      course.studentCount === course.enrollments.length &&
        course.studentCount === course.students.length,
      "Enrollment count mismatch",
    );
    ensure(
      course.outcomeCount === course.outcomes.length,
      "Outcome count mismatch",
    );
    ensure(
      new Set(course.enrollments.map((item) => item.studentId)).size ===
        course.enrollments.length,
      "Duplicate enrollment",
    );
    for (const student of course.students)
      ensure(students.has(student.id), "Course student reference");
    for (const enrollment of course.enrollments)
      ensure(
        students.has(enrollment.studentId) && enrollment.courseId === course.id,
        "Enrollment reference",
      );
    for (const outcome of course.outcomes)
      ensure(outcome.courseId === course.id, "Outcome course reference");
    for (const material of course.materials)
      ensure(material.courseId === course.id, "Material course reference");
    for (const summary of course.assessments) {
      const assessment = db.assessments.find((item) => item.id === summary.id);
      ensure(
        assessment &&
          assessment.courseId === course.id &&
          summary.courseId === course.id &&
          summary.type === assessment.type &&
          summary.questionCount === assessment.questions.length,
        "Assessment summary reference",
      );
    }
  }
  for (const assessment of db.assessments) {
    ensure(
      courses.has(assessment.courseId) && assessment.questions.length === 5,
      "Assessment course and question count",
    );
    for (const question of assessment.questions) {
      ensure(
        db.courses
          .find((item) => item.id === assessment.courseId)
          ?.outcomes.some((item) => item.id === question.outcomeId),
        "Question outcome reference",
      );
      const rule = db.gradingRules[question.id];
      ensure(rule, "Missing private grading rule");
      ensure(
        misconceptions.has(rule.misconceptionId) &&
          db.misconceptions.find((item) => item.id === rule.misconceptionId)
            ?.outcomeId === question.outcomeId,
        "Grading misconception reference",
      );
      ensure(
        question.type === "MULTIPLE_CHOICE"
          ? question.options.some((item) => item.id === rule.correctOptionId)
          : rule.correctOptionId === null &&
              question.options.length === 0 &&
              (rule.acceptedAnswers.length > 0 ||
                rule.requiredTerms.length > 0),
        "Private grading rule shape",
      );
    }
  }
  ensure(
    Object.keys(db.gradingRules).length === questions.size,
    "Orphan grading rule",
  );
  for (const item of db.misconceptions)
    ensure(outcomes.has(item.outcomeId), "Misconception outcome reference");
  for (const submission of db.submissions) {
    const assessment = db.assessments.find(
      (item) => item.id === submission.assessmentId,
    );
    ensure(
      assessment && students.has(submission.studentId),
      "Submission entity references",
    );
    ensure(
      submission.feedback.length === assessment.questions.length &&
        new Set(submission.feedback.map((item) => item.questionId)).size ===
          submission.feedback.length,
      "Submission feedback coverage",
    );
    ensure(
      submission.scorePercentage ===
        mean(submission.feedback.map((item) => (item.correct ? 100 : 0))),
      "Submission score mismatch",
    );
    const percentages = outcomePercentages(assessment, submission.feedback);
    for (const feedback of submission.feedback) {
      ensure(
        assessment.questions.some(
          (item) =>
            item.id === feedback.questionId &&
            item.outcomeId === feedback.outcomeId,
        ),
        "Feedback question/outcome reference",
      );
      ensure(
        feedback.correct
          ? feedback.misconceptionId === null
          : db.misconceptions.some(
              (item) =>
                item.id === feedback.misconceptionId &&
                item.outcomeId === feedback.outcomeId,
            ),
        "Incorrect answer needs matching misconception",
      );
    }
    for (const impact of submission.outcomeImpacts)
      ensure(
        percentages.get(impact.outcomeId) === impact.percentage &&
          impact.change === impact.percentage - impact.previousPercentage,
        "Outcome impact consistency",
      );
  }
  ensure(
    new Set(db.masteries.map((item) => item.studentId + ":" + item.courseId))
      .size === db.masteries.length,
    "Duplicate mastery summary",
  );
  for (const mastery of db.masteries) {
    masterySchema.parse(mastery);
    ensure(
      students.has(mastery.studentId) && courses.has(mastery.courseId),
      "Mastery entity references",
    );
    ensure(
      mastery.overallPercentage ===
        mean(mastery.outcomes.map((item) => item.percentage)),
      "Overall mastery mismatch",
    );
    const diagnostic = db.assessments.find(
      (item) =>
        item.courseId === mastery.courseId && item.type === "DIAGNOSTIC",
    );
    const followUp = db.assessments.find(
      (item) => item.courseId === mastery.courseId && item.type === "FOLLOW_UP",
    );
    const diagnosticSubmission = db.submissions.find(
      (item) =>
        item.studentId === mastery.studentId &&
        item.assessmentId === diagnostic?.id,
    );
    const followUpSubmission = db.submissions.find(
      (item) =>
        item.studentId === mastery.studentId &&
        item.assessmentId === followUp?.id,
    );
    ensure(
      diagnostic && diagnosticSubmission && followUp,
      "Mastery diagnostic evidence",
    );
    const baseline = outcomePercentages(
      diagnostic,
      diagnosticSubmission.feedback,
    );
    const latest = followUpSubmission
      ? outcomePercentages(followUp, followUpSubmission.feedback)
      : baseline;
    for (const outcome of mastery.outcomes) {
      ensure(
        outcomes.has(outcome.outcomeId) &&
          baseline.get(outcome.outcomeId) === outcome.diagnosticPercentage &&
          latest.get(outcome.outcomeId) === outcome.percentage,
        "Mastery must use the same assessment results",
      );
      ensure(
        outcome.change ===
          (outcome.followUpPercentage === null
            ? 0
            : outcome.followUpPercentage - outcome.diagnosticPercentage),
        "Mastery improvement mismatch",
      );
      for (const source of outcome.evidence)
        ensure(
          source.type === "ASSESSMENT"
            ? assessments.has(source.id)
            : source.type === "PROJECT"
              ? projects.has(source.id)
              : professors.has(source.id),
          "Evidence source reference",
        );
      for (const misconceptionId of outcome.misconceptionIds)
        ensure(
          db.misconceptions.some(
            (item) =>
              item.id === misconceptionId &&
              item.outcomeId === outcome.outcomeId,
          ),
          "Mastery misconception reference",
        );
    }
  }
  for (const plan of db.learningPlans) {
    ensure(
      students.has(plan.studentId) && courses.has(plan.courseId),
      "Plan entity references",
    );
    ensure(
      new Set(plan.tasks.map((item) => item.order)).size === plan.tasks.length,
      "Task order uniqueness",
    );
    for (const task of plan.tasks)
      ensure(
        db.courses
          .find((item) => item.id === plan.courseId)
          ?.outcomes.some((item) => item.id === task.outcomeId),
        "Task outcome reference",
      );
  }
  for (const intervention of db.interventions) {
    ensure(
      db.courses.some(
        (item) =>
          item.id === intervention.courseId &&
          item.professorId === intervention.professorId &&
          item.outcomes.some(
            (outcome) => outcome.id === intervention.outcomeId,
          ),
      ),
      "Intervention entity references",
    );
    for (const id of intervention.evidenceAssessmentIds)
      ensure(assessments.has(id), "Intervention evidence reference");
    ensure(
      intervention.affectedStudentCount ===
        db.masteries.filter(
          (item) =>
            item.courseId === intervention.courseId &&
            item.outcomes.some(
              (outcome) =>
                outcome.outcomeId === intervention.outcomeId &&
                outcome.percentage < 70,
            ),
        ).length,
      "Intervention affected student count",
    );
  }
  for (const course of db.courses) {
    const insight = getInsight(db, course.id, course.professorId);
    insightSchema.parse(insight);
    for (const outcome of insight.outcomes) {
      for (const id of outcome.supportStudentIds)
        ensure(students.has(id), "Insight support reference");
    }
    for (const group of insight.supportGroups) {
      ensure(outcomes.has(group.outcomeId), "Support group outcome reference");
      for (const id of group.studentIds)
        ensure(students.has(id), "Support group student reference");
    }
  }
}
