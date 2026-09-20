import { students, professor, seedTimestamp } from "@/lib/mocks/data/academic";
import type {
  CareerProfile,
  Opportunity,
  ProjectEvidence,
  SkillGap,
  SkillEvidence,
} from "@/types/opportunity";

export const targetRoleId = "role-junior-software-developer";
export const initialCareerProfile: CareerProfile = {
  studentId: students[0].id,
  targetRoleId,
  targetRole: "Boshlang‘ich dasturiy ta’minot ishlab chiquvchisi",
  interests: ["Dasturlash", "Ta’lim texnologiyalari"],
  readinessStage: "FOUNDATION",
  skills: [],
  consent: {
    discoverable: false,
    peerRecommendations: true,
    professorEvidenceReview: true,
  },
};
export const skillLabels: Record<string, string> = {
  "skill-recursion": "Rekursiv masalalar yechish",
  "skill-call-analysis": "Chaqiriqlarni tahlil qilish",
  "skill-collaboration": "Jamoada loyiha yaratish",
};
export const gaps: SkillGap[] = [
  {
    skillId: "skill-collaboration",
    label: skillLabels["skill-collaboration"],
    reason: "Hozirgi loyihada jamoaviy hissa dalili mavjud emas.",
    requiredEvidence: "Jamoa bilan yaratilgan loyiha va tasdiqlangan hissa.",
  },
];
export const projects: ProjectEvidence[] = [
  {
    id: "project-recursion-visualizer",
    studentId: students[0].id,
    title: "Rekursiya kuzatuvchisi",
    description:
      "Chaqiriqlarni bosqichma-bosqich tasvirlovchi shaxsiy mini-loyiha.",
    skillIds: ["skill-recursion", "skill-call-analysis"],
    collaborative: false,
    verification: "UNVERIFIED",
  },
];
const careerRoles: readonly [string, string, "INTERNSHIP" | "JOB"][] = [
  [
    "opportunity-campus-web-internship",
    "Universitet veb-loyihalari amaliyoti",
    "INTERNSHIP",
  ],
  [
    "opportunity-education-platform-internship",
    "Ta’lim platformasi amaliyoti",
    "INTERNSHIP",
  ],
  [
    "opportunity-frontend-internship",
    "Frontend dasturlash amaliyoti",
    "INTERNSHIP",
  ],
  [
    "opportunity-backend-internship",
    "Backend dasturlash amaliyoti",
    "INTERNSHIP",
  ],
  ["opportunity-junior-web-developer", "Boshlang‘ich veb-dasturchi", "JOB"],
  [
    "opportunity-junior-software-developer",
    "Boshlang‘ich dasturiy ta’minot ishlab chiquvchisi",
    "JOB",
  ],
];
export const opportunities: Opportunity[] = [
  {
    id: "opportunity-peer-javohir",
    type: "PEER",
    title: "Javohir bilan loyiha hamkorligi",
    description:
      "Rekursiya mini-loyihasini birga rivojlantirish va hissalarni hujjatlashtirish.",
    relatedUserId: students[1].id,
    targetRoleIds: [targetRoleId],
    skillIds: ["skill-recursion"],
    gapSkillIds: ["skill-collaboration"],
    collaborative: true,
  },
  {
    id: "opportunity-mentor-azizbek",
    type: "MENTOR",
    title: "Azizbek Rahmonov bilan maslahat",
    description:
      "Ustoz bilan texnik dalillar va rivojlanish yo‘lini ko‘rib chiqish.",
    relatedUserId: professor.id,
    targetRoleIds: [targetRoleId],
    skillIds: ["skill-recursion", "skill-call-analysis"],
    gapSkillIds: ["skill-collaboration"],
    collaborative: false,
  },
  {
    id: "opportunity-campus-code-club",
    type: "CLUB",
    title: "Universitet dasturlash klubi",
    description:
      "Jamoaviy dasturlash mashg‘ulotlari va loyiha hissasini qayd etish.",
    relatedUserId: null,
    targetRoleIds: [targetRoleId],
    skillIds: ["skill-recursion"],
    gapSkillIds: ["skill-collaboration"],
    collaborative: true,
  },
  {
    id: "opportunity-learning-tool-project",
    type: "PROJECT",
    title: "O‘quv vositasi jamoaviy loyihasi",
    description: "Rekursiyani tushuntiruvchi vositani kichik jamoada yaratish.",
    relatedUserId: null,
    targetRoleIds: [targetRoleId],
    skillIds: ["skill-recursion", "skill-call-analysis"],
    gapSkillIds: ["skill-collaboration"],
    collaborative: true,
  },
  {
    id: "opportunity-algorithm-club",
    type: "CLUB",
    title: "Algoritmlar klubi",
    description: "Masalalarni juftlikda yechish va izohlarni muhokama qilish.",
    relatedUserId: null,
    targetRoleIds: [targetRoleId],
    skillIds: ["skill-call-analysis"],
    gapSkillIds: ["skill-collaboration"],
    collaborative: true,
  },
  ...careerRoles.map(([id, title, type]): Opportunity => ({
    id,
    title,
    type,
    description:
      "Bu sintetik demo imkoniyati. Dasturlash asoslari va jamoaviy loyiha dalillari talab etiladi.",
    relatedUserId: null,
    targetRoleIds: [targetRoleId],
    skillIds: ["skill-recursion", "skill-call-analysis"],
    gapSkillIds: ["skill-collaboration"],
    collaborative: true,
  })),
];
export const initialEndorsement = {
  id: "endorsement-dilnoza-junior",
  studentId: students[0].id,
  professorId: professor.id,
  opportunityId: "opportunity-junior-software-developer",
  targetRole: initialCareerProfile.targetRole,
  consentToReview: true,
  status: "REQUESTED",
  professorFeedback: null,
  requestedAt: seedTimestamp,
  history: [{ status: "REQUESTED", recordedAt: seedTimestamp }],
} as const;
export const recommendationExplanation = (collaborative: boolean) =>
  collaborative
    ? "Maqsadli rol va ko‘rsatilgan ko‘nikmalar mosligi hisobga olindi. Jamoaviy loyiha yetishmayotgan hamkorlik dalilini to‘plashga yordam beradi."
    : "Maqsadli rol va ko‘rsatilgan ko‘nikmalarga mos maslahat yoki hamkorlik imkoniyati.";

export function evidenceSummary(
  name: string,
  skills: SkillEvidence[],
  missing: SkillGap[],
): string {
  const demonstrated = skills
    .map((skill) => `${skill.label}: ${skill.percentage}%`)
    .join("; ");
  return `${name} bo‘yicha baholash dalillari: ${demonstrated}. ${missing.length ? "Jamoaviy loyiha hissasini tasdiqlovchi dalil hali yetishmaydi." : "Jamoaviy loyiha dalili mavjud."} Muloqot bo‘yicha alohida dalil kiritilmagan; bu salohiyat haqida xulosa emas. Yakuniy tavsiya qarorini professor dalillarni ko‘rib chiqqach beradi.`;
}
