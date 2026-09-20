import type { AuthUser, UserRole } from "@/features/auth/types";

export type { AuthUser, UserRole };
export interface University {
  id: string;
  name: string;
}
export interface Faculty {
  id: string;
  name: string;
  universityId: string;
}
export interface StudentSummary extends AuthUser {
  role: "STUDENT";
  universityId: string | null;
  facultyId: string | null;
}
export interface ProfessorSummary extends AuthUser {
  role: "PROFESSOR";
  universityId: string | null;
  facultyId: string | null;
}
