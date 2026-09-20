export type UserRole = "STUDENT" | "PROFESSOR" | "ADMIN";

export interface AuthUser {
  id: string;
  fullName: string;
  role: UserRole;
  university: string;
  faculty: string;
  avatarLabel: string;
}

export interface AuthSession {
  user: AuthUser;
  mode: "DEMO" | "HTTP";
}
export interface AuthenticatedUser extends AuthUser {
  profileId: string;
  onboardingCompleted: boolean;
}
