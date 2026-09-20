import type { ClubRecord } from "@/types/opportunity";
import type { ProfessorSummary, StudentSummary } from "@/types/user";

export interface AdminOverview {
  students: StudentSummary[];
  professors: ProfessorSummary[];
  clubs: ClubRecord[];
  stats: {
    totalStudents: number;
    totalProfessors: number;
    pendingClubs: number;
    approvedClubs: number;
    rejectedClubs: number;
  };
}

export type ClubDecision = "APPROVED" | "REJECTED";