import {
  BookOpenCheck,
  BriefcaseBusiness,
  ClipboardList,
  Compass,
  LayoutDashboard,
  ListChecks,
  Network,
  Presentation,
  ShieldCheck,
  type LucideIcon,
  Send,
  Settings,
  Sparkles,
  UsersRound,
} from "lucide-react";

import type { UserRole } from "@/features/auth/types";
import type { TranslationKey } from "@/i18n";

export type NavigationItem = {
  href: string;
  label: TranslationKey;
  icon: LucideIcon;
  children?: readonly NavigationItem[];
};

export const roleNavigation = {
  STUDENT: [
    {
      href: "/student/dashboard",
      label: "navDashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/student/courses",
      label: "navMyCourses",
      icon: BookOpenCheck,
      children: [
        {
          href: "/student/courses",
          label: "navMyCourses",
          icon: BookOpenCheck,
        },
        {
          href: "/student/assessments",
          label: "navAssessments",
          icon: ClipboardList,
        },
        {
          href: "/student/learning-plan",
          label: "navLearningPlan",
          icon: ListChecks,
        },
      ],
    },
    { href: "/student/progress", label: "navMyProgress", icon: Sparkles },
    {
      href: "/student/opportunities",
      label: "navOpportunities",
      icon: Compass,
      children: [
        {
          href: "/student/opportunities/profile",
          label: "navCareerProfile",
          icon: UsersRound,
        },
        {
          href: "/student/opportunities/jobs",
          label: "navJobMarket",
          icon: BriefcaseBusiness,
        },
        {
          href: "/student/opportunities/network",
          label: "navRecommendedConnections",
          icon: Network,
        },
        {
          href: "/student/opportunities/clubs",
          label: "navClubsProjects",
          icon: UsersRound,
        },
        {
          href: "/student/opportunities/endorsements",
          label: "navProfessorEndorsement",
          icon: Send,
        },
      ],
    },
    { href: "/student/surveys", label: "navSurveys", icon: ClipboardList },
    { href: "/student/settings", label: "navSettings", icon: Settings },
  ],
  PROFESSOR: [
    {
      href: "/professor/dashboard",
      label: "navDashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/professor/courses",
      label: "navMyCourses",
      icon: BookOpenCheck,
      children: [
        {
          href: "/professor/courses",
          label: "navMyCourses",
          icon: BookOpenCheck,
        },
        {
          href: "/professor/courses/new",
          label: "navCreateCourse",
          icon: Sparkles,
        },
      ],
    },
    { href: "/professor/referrals", label: "navReferrals", icon: Send },
    {
      href: "/professor/growth-plan",
      label: "navLearningPlan",
      icon: ListChecks,
    },
    { href: "/professor/surveys", label: "navSurveys", icon: UsersRound },
    { href: "/professor/settings", label: "navSettings", icon: Settings },
  ],
  ADMIN: [
    { href: "/admin/dashboard", label: "navDashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "navStudents", icon: UsersRound },
    { href: "/admin/professors", label: "navProfessors", icon: Presentation },
    { href: "/admin/clubs", label: "navClubRequests", icon: ShieldCheck },
  ],
} as const satisfies Record<UserRole, readonly NavigationItem[]>;
