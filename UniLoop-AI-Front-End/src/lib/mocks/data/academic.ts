import { demoUsers } from "@/features/auth/demo-users";
import type { Assessment, Question } from "@/types/assessment";
import type { CourseDetail } from "@/types/course";
import type { Misconception } from "@/types/mastery";
import type {
  ProfessorSummary,
  StudentSummary,
  University,
  Faculty,
} from "@/types/user";

export const seedTimestamp = "2026-09-01T09:00:00.000Z";
export const courseId = "course-programming-fundamentals";
export const university: University = {
  id: "university-samarkand",
  name: demoUsers.STUDENT.university,
};
export const faculties: Faculty[] = [
  {
    id: "faculty-computer-science",
    name: demoUsers.STUDENT.faculty,
    universityId: university.id,
  },
  {
    id: "department-information-technology",
    name: demoUsers.PROFESSOR.faculty,
    universityId: university.id,
  },
];
export const professor: ProfessorSummary = {
  ...demoUsers.PROFESSOR,
  universityId: university.id,
  facultyId: faculties[1].id,
};
const additionalStudents = [
  ["student-javohir-aliyev", "Javohir Aliyev", "JA"],
  ["student-madina-yusupova", "Madina Yusupova", "MY"],
  ["student-sardor-nazarov", "Sardor Nazarov", "SN"],
  ["student-shahnoza-olimova", "Shahnoza Olimova", "SO"],
  ["student-bekzod-rahimov", "Bekzod Rahimov", "BR"],
  ["student-nodira-hasanova", "Nodira Hasanova", "NH"],
  ["student-umid-ismoilov", "Umid Ismoilov", "UI"],
  ["student-aziza-sobirova", "Aziza Sobirova", "AS"],
  ["student-temur-qodirov", "Temur Qodirov", "TQ"],
] as const;
export const students: StudentSummary[] = [
  {
    ...demoUsers.STUDENT,
    universityId: university.id,
    facultyId: faculties[0].id,
  },
  ...additionalStudents.map(([id, fullName, avatarLabel]): StudentSummary => ({
    id,
    fullName,
    avatarLabel,
    role: "STUDENT",
    university: university.name,
    faculty: faculties[0].name,
    universityId: university.id,
    facultyId: faculties[0].id,
  })),
];
export const outcomes = [
  {
    id: "outcome-recursion-base-case",
    courseId,
    title: "To‘xtash sharti",
    description: "Rekursiyaning tugash shartini aniqlash.",
  },
  {
    id: "outcome-recursive-call",
    courseId,
    title: "Rekursiv chaqiriq",
    description: "Kichikroq masala uchun rekursiv chaqiriqni yozish.",
  },
  {
    id: "outcome-call-sequence",
    courseId,
    title: "Chaqiriqlar ketma-ketligi",
    description: "Chaqiriq va qaytish bosqichlarini kuzatish.",
  },
  {
    id: "outcome-recursive-solution",
    courseId,
    title: "To‘liq rekursiv yechim",
    description: "To‘xtash sharti va rekursiv bosqichni birlashtirish.",
  },
];
export const misconceptions: Misconception[] = [
  {
    id: "misconception-no-base-case",
    outcomeId: outcomes[0].id,
    description: "To‘xtash sharti bo‘lmasa, chaqiriqlar davom etib ketadi.",
  },
  {
    id: "misconception-no-decrease",
    outcomeId: outcomes[1].id,
    description: "Rekursiv chaqiriqda masala kichrayishi kerak.",
  },
  {
    id: "misconception-return-order",
    outcomeId: outcomes[2].id,
    description: "Natijalar oxirgi chaqiriqdan boshlab qaytadi.",
  },
  {
    id: "misconception-incomplete-solution",
    outcomeId: outcomes[3].id,
    description:
      "To‘liq yechimda to‘xtash sharti va natijani qaytarish bo‘lishi kerak.",
  },
];
export const diagnostic: Assessment = {
  id: "assessment-recursion-diagnostic",
  courseId,
  type: "DIAGNOSTIC",
  title: "Rekursiya bo‘yicha diagnostika",
  estimatedMinutes: 12,
  questions: [
    {
      id: "question-diagnostic-base",
      outcomeId: outcomes[0].id,
      type: "MULTIPLE_CHOICE",
      prompt: "Faktorial funksiyasining to‘xtash sharti qaysi?",
      options: [
        { id: "option-base-zero", text: "n = 0 bo‘lsa, 1 qaytarish" },
        {
          id: "option-base-call",
          text: "Har safar funksiyani qayta chaqirish",
        },
      ],
    },
    {
      id: "question-diagnostic-call",
      outcomeId: outcomes[1].id,
      type: "MULTIPLE_CHOICE",
      prompt: "n! ni hisoblashdagi rekursiv bosqich qaysi?",
      options: [
        { id: "option-call-smaller", text: "n * factorial(n - 1)" },
        { id: "option-call-same", text: "n * factorial(n)" },
      ],
    },
    {
      id: "question-diagnostic-sequence",
      outcomeId: outcomes[2].id,
      type: "MULTIPLE_CHOICE",
      prompt: "factorial(3) chaqirilganda qaysi natija avval qaytadi?",
      options: [
        { id: "option-sequence-zero", text: "factorial(0) natijasi" },
        { id: "option-sequence-three", text: "factorial(3) natijasi" },
      ],
    },
    {
      id: "question-diagnostic-return",
      outcomeId: outcomes[3].id,
      type: "SHORT_ANSWER",
      prompt: "factorial(0) qaytaradigan qiymatni yozing.",
      options: [],
    },
    {
      id: "question-diagnostic-solution",
      outcomeId: outcomes[3].id,
      type: "SHORT_ANSWER",
      prompt: "To‘liq rekursiv yechimning ikki zarur qismini yozing.",
      options: [],
    },
  ],
};
export const followUp: Assessment = {
  id: "assessment-recursion-follow-up",
  courseId,
  type: "FOLLOW_UP",
  title: "Rekursiya bo‘yicha qayta diagnostika",
  estimatedMinutes: 12,
  questions: diagnostic.questions.map((question, index): Question => ({
    ...question,
    id: question.id.replace("diagnostic", "follow-up"),
    prompt:
      index === 2
        ? "Chaqiriqlar qaytishi qaysi bosqichdan boshlanadi?"
        : question.prompt,
    options: question.options.map((option) => ({
      ...option,
      id: option.id.replace("option-", "option-follow-up-"),
    })),
  })),
};
export const course: CourseDetail = {
  id: courseId,
  title: "Dasturlash asoslari",
  code: "CS-101",
  professorId: professor.id,
  studentCount: students.length,
  outcomeCount: outcomes.length,
  description:
    "Algoritmlar, funksiyalar va rekursiya orqali dasturlash asoslarini o‘rganish.",
  professor,
  students,
  enrollments: students.map((student) => ({
    studentId: student.id,
    courseId,
    enrolledAt: seedTimestamp,
  })),
  outcomes,
  materials: [
    {
      id: "material-recursion-guide",
      courseId,
      title: "Rekursiv funksiyalar",
      content:
        "To‘xtash sharti, rekursiv chaqiriq va chaqiriqlar qaytishi misollari.",
      uploadedAt: seedTimestamp,
    },
  ],
  assessments: [diagnostic, followUp].map(({ id, title, type, questions }) => ({
    id,
    title,
    type,
    courseId,
    questionCount: questions.length,
  })),
  latestFeedback:
    "Chaqiriqlar qaytishini bosqichma-bosqich kuzatish va to‘liq yechim yozishni mashq qiling.",
};
export const diagnosticCorrectness: readonly (readonly boolean[])[] = [
  [true, true, false, false, false],
  [true, true, true, true, true],
  [true, true, false, true, false],
  [true, false, false, false, false],
  [true, true, true, true, false],
  [true, true, false, false, true],
  [true, true, true, true, true],
  [false, true, false, false, false],
  [true, true, true, false, true],
  [true, false, false, false, false],
];
