import type { TranslationKey } from "@/i18n";
import type { LearningTaskType, TaskStatus } from "@/types/learning-plan";

export const taskTypeLabels: Record<LearningTaskType, TranslationKey> = {
  EXPLANATION: "taskExplanation",
  PRACTICE: "taskPractice",
  MINI_PROJECT: "taskMiniProject",
  FOLLOW_UP_DIAGNOSTIC: "taskFollowUpDiagnostic",
};

export const taskStatusLabels: Record<TaskStatus, TranslationKey> = {
  NOT_STARTED: "taskNotStarted",
  IN_PROGRESS: "taskInProgress",
  COMPLETED: "taskCompleted",
};
