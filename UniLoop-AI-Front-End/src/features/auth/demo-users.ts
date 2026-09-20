import type { AuthSession, AuthUser, UserRole } from "@/features/auth/types";

export const demoUsers = {
  STUDENT: {
    id: "student-dilnoza-karimova",
    fullName: "Dilnoza Karimova",
    role: "STUDENT",
    university: "Samarqand davlat universiteti",
    faculty: "Kompyuter ilmlari fakulteti",
    avatarLabel: "DK",
  },
  PROFESSOR: {
    id: "professor-azizbek-rahmonov",
    fullName: "Azizbek Rahmonov",
    role: "PROFESSOR",
    university: "Samarqand davlat universiteti",
    faculty: "Axborot texnologiyalari kafedrasi",
    avatarLabel: "AR",
  },
  ADMIN: {
    id: "admin-uniloop",
    fullName: "UniLoop administratori",
    role: "ADMIN",
    university: "Samarqand davlat universiteti",
    faculty: "Universitet boshqaruvi",
    avatarLabel: "UA",
  },
} as const satisfies Record<UserRole, AuthUser>;

export function getDemoUser(role: UserRole): AuthUser {
  return demoUsers[role];
}

export function getDemoSession(role: UserRole): AuthSession {
  return { user: getDemoUser(role), mode: "DEMO" };
}
