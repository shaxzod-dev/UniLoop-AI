export type LearningTaskType =
  "EXPLANATION" | "PRACTICE" | "MINI_PROJECT" | "FOLLOW_UP_DIAGNOSTIC";
export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export interface LearningTask {
  id: string;
  outcomeId: string;
  order: number;
  title: string;
  type: LearningTaskType;
  status: TaskStatus;
  estimatedMinutes: number;
  reason: string;
  actionTarget: string;
}
export interface LearningPlan {
  id: string;
  courseId: string;
  studentId: string;
  createdAt: string;
  tasks: LearningTask[];
}
