import { submissionInputSchema } from "@/features/assessments/contracts";
import {
  generationInputSchema,
  materialInputSchema,
} from "@/features/courses/contracts";
import { interventionDecisionSchema } from "@/features/interventions/contracts";
import {
  gradeAnswers,
  masteryLevel,
  mean,
  outcomePercentages,
} from "@/lib/mocks/academic-state";
import { ApiError } from "@/lib/api/errors";
import { nextMutation, type MockDatabase } from "@/lib/mocks/database";
import { required } from "@/lib/mocks/read-models";
import { assessmentDto } from "@/lib/mocks/serializers";
import { validateInput } from "@/lib/mocks/validation";
import type { SubmissionResult } from "@/types/assessment";
import type { TransportRequest } from "@/lib/api/transport";

export function academicMutation(
  db: MockDatabase,
  request: TransportRequest,
  studentId: string,
  professorId: string,
): unknown {
  const { endpoint, body } = request;
  const courseId = endpoint.params.courseId;
  switch (endpoint.name) {
    case "submitAssessment": {
      const assessment = required(
        db.assessments,
        (item) => item.id === endpoint.params.assessmentId,
      );
      const input = validateInput(submissionInputSchema, body);
      if (
        input.answers.length !== assessment.questions.length ||
        new Set(input.answers.map((item) => item.questionId)).size !==
          input.answers.length
      )
        throw new ApiError("VALIDATION_ERROR", 422, "apiValidationError");
      for (const answer of input.answers) {
        const question = required(
          assessment.questions,
          (item) => item.id === answer.questionId,
        );
        if (
          question.type === "MULTIPLE_CHOICE"
            ? !answer.optionId ||
              answer.answer !== undefined ||
              !question.options.some((item) => item.id === answer.optionId)
            : !answer.answer || answer.optionId !== undefined
        )
          throw new ApiError("VALIDATION_ERROR", 422, "apiValidationError");
      }
      const mastery = required(
        db.masteries,
        (item) =>
          item.studentId === studentId && item.courseId === assessment.courseId,
      );
      const feedback = gradeAnswers(
        assessment,
        input.answers.map(({ answer, ...item }) => ({ ...item, text: answer })),
        db.gradingRules,
      );
      const percentages = outcomePercentages(assessment, feedback);
      const mutation = nextMutation(db);
      const outcomeImpacts = mastery.outcomes.map((item) => {
        const previousPercentage = item.percentage;
        const percentage =
          percentages.get(item.outcomeId) ?? previousPercentage;
        item.percentage = percentage;
        if (assessment.type === "DIAGNOSTIC") {
          item.diagnosticPercentage = percentage;
          item.followUpPercentage = null;
        } else item.followUpPercentage = percentage;
        item.change =
          item.followUpPercentage === null
            ? 0
            : percentage - (item.diagnosticPercentage ?? percentage);
        item.level = masteryLevel(percentage);
        item.evidence = [
          ...item.evidence.filter(
            (source) =>
              source.id !== assessment.id &&
              (assessment.type !== "DIAGNOSTIC" ||
                !db.assessments.some(
                  (entry) =>
                    entry.id === source.id && entry.type === "FOLLOW_UP",
                )),
          ),
          {
            id: assessment.id,
            type: "ASSESSMENT",
            verification: "UNVERIFIED",
            recordedAt: mutation.recordedAt,
          },
        ];
        item.misconceptionIds = [
          ...new Set(
            feedback
              .filter((entry) => entry.outcomeId === item.outcomeId)
              .flatMap((entry) =>
                entry.misconceptionId ? [entry.misconceptionId] : [],
              ),
          ),
        ];
        item.nextAction =
          percentage < 70
            ? "Maqsadli mashqni bajaring."
            : "Jamoaviy loyiha orqali dalil to‘plang.";
        return {
          outcomeId: item.outcomeId,
          previousPercentage,
          percentage,
          change: percentage - previousPercentage,
        };
      });
      mastery.overallPercentage = mean(
        mastery.outcomes.map((item) => item.percentage),
      );
      const result: SubmissionResult = {
        id: `submission-${assessment.id}-${mutation.revision}`,
        assessmentId: assessment.id,
        studentId,
        submittedAt: mutation.recordedAt,
        scorePercentage: mean(feedback.map((item) => (item.correct ? 100 : 0))),
        feedback,
        outcomeImpacts,
        aiExplanation: feedback.some((item) => !item.correct)
          ? "Xatolar tegishli o‘quv natijalariga bog‘landi. Izoh va maqsadli mashqni ko‘rib chiqing."
          : "Yangi dalillar o‘quv natijalaridagi rivojlanishni ko‘rsatmoqda.",
        nextRecommendedAction:
          mastery.overallPercentage >= 70
            ? {
                label: "Jamoaviy loyiha topish",
                href: "/student/opportunities",
              }
            : {
                label: "Rivojlanish rejasini ko‘rish",
                href: `/student/learning-plan/${assessment.courseId}`,
              },
      };
      db.submissions = db.submissions.filter(
        (item) =>
          item.studentId !== studentId ||
          (item.assessmentId !== assessment.id &&
            (assessment.type !== "DIAGNOSTIC" ||
              !db.assessments.some(
                (entry) =>
                  entry.id === item.assessmentId && entry.type === "FOLLOW_UP",
              ))),
      );
      db.submissions.push(result);
      required(
        db.courses,
        (item) => item.id === assessment.courseId,
      ).latestFeedback = result.aiExplanation;
      for (const intervention of db.interventions.filter(
        (item) => item.courseId === assessment.courseId,
      )) {
        intervention.affectedStudentCount = db.masteries.filter(
          (item) =>
            item.courseId === assessment.courseId &&
            item.outcomes.some(
              (entry) =>
                entry.outcomeId === intervention.outcomeId &&
                entry.percentage < 70,
            ),
        ).length;
      }
      const plan = db.learningPlans.find(
        (item) =>
          item.studentId === studentId && item.courseId === assessment.courseId,
      );
      if (plan)
        plan.tasks.forEach((item) => {
          item.status =
            assessment.type === "FOLLOW_UP" && mastery.overallPercentage >= 70
              ? "COMPLETED"
              : "NOT_STARTED";
        });
      return { data: result };
    }
    case "generateLearningPlan": {
      required(db.courses, (item) => item.id === courseId);
      const plan = required(
        db.learningPlans,
        (item) => item.studentId === studentId && item.courseId === courseId,
      );
      plan.createdAt = nextMutation(db).recordedAt;
      return { data: plan };
    }
    case "decideIntervention": {
      const intervention = required(
        db.interventions,
        (item) =>
          item.id === endpoint.params.interventionId &&
          item.courseId === courseId &&
          item.professorId === professorId,
      );
      intervention.status = validateInput(
        interventionDecisionSchema,
        body,
      ).status;
      nextMutation(db);
      return { data: intervention };
    }
    case "suggestInterventions":
      required(
        db.courses,
        (item) => item.id === courseId && item.professorId === professorId,
      );
      return {
        data: db.interventions.filter((item) => item.courseId === courseId),
      };
    case "professorGrowthPlan":
      return {
        data: {
          id: "growth-plan-professor-demo",
          professorId,
          actions: db.interventions.map((item) => ({
            title: item.suggestedAction,
            reason: item.reason,
            courseId: item.courseId,
          })),
        },
      };
    case "courseMaterials": {
      const course = required(
        db.courses,
        (item) => item.id === courseId && item.professorId === professorId,
      );
      const input = validateInput(materialInputSchema, body);
      const mutation = nextMutation(db);
      const material = {
        id: `material-upload-${mutation.revision}`,
        courseId,
        ...input,
        uploadedAt: mutation.recordedAt,
      };
      course.materials.push(material);
      return { data: material };
    }
    case "extractOutcomes":
      return {
        data: required(
          db.courses,
          (item) => item.id === courseId && item.professorId === professorId,
        ).outcomes,
      };
    case "generateAssessment": {
      required(
        db.courses,
        (item) => item.id === courseId && item.professorId === professorId,
      );
      const { type } = validateInput(generationInputSchema, body);
      return {
        data: assessmentDto(
          required(
            db.assessments,
            (item) => item.courseId === courseId && item.type === type,
          ),
        ),
      };
    }
    default:
      throw new ApiError("NOT_FOUND", 404, "apiNotFound");
  }
}
