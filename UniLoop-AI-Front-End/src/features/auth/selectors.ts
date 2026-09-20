import { getDemoSession, getDemoUser } from "@/features/auth/demo-users";
import type { AuthSession, AuthUser, UserRole } from "@/features/auth/types";

export function selectDemoUser(role: UserRole | null): AuthUser | null {
  return role ? getDemoUser(role) : null;
}

export function selectDemoSession(role: UserRole | null): AuthSession | null {
  return role ? getDemoSession(role) : null;
}

export function getDashboardPath(role: UserRole): string {
  if (role === "STUDENT") return "/student/dashboard";
  if (role === "PROFESSOR") return "/professor/dashboard";
  return "/admin/dashboard";
}
