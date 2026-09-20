"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, GraduationCap, Presentation, Sparkles, UsersRound } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "@/features/auth/api";
import { getDashboardPath } from "@/features/auth/selectors";
import { useAuthStore } from "@/features/auth/store";
import { ApiError } from "@/lib/api/errors";

function splitValues(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

const realStudentProfile = {
  university: "UrDU",
  faculty: "AT Fakulteti",
  major: "AI Data Scientist",
  studyYear: "2",
  targetRole: "EdTech",
  interests: "AI, EdTech, FinTech, Data Science, Engineering",
  skills: "Next.js, JavaScript, TypeScript",
};

const realProfessorProfile = {
  university: "UrDU",
  department: "AT Fakulteti",
  title: "Katta o‘qituvchi",
  expertise: "AI, Data Science, Software Engineering, EdTech",
};

export function OnboardingPanel() {
  const router = useRouter();
  const { hydrated, user, accessToken } = useAuthStore();
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [major, setMajor] = useState("");
  const [studyYear, setStudyYear] = useState("1");
  const [targetRole, setTargetRole] = useState("");
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");
  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [expertise, setExpertise] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if ("onboardingCompleted" in user && user.onboardingCompleted) router.replace(getDashboardPath(user.role));
  }, [hydrated, router, user]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("No active session");
      return user.role === "STUDENT"
        ? completeOnboarding({
            university, faculty, major, studyYear: Number(studyYear), targetRole,
            interests: splitValues(interests), skills: splitValues(skills),
            discoverable: true, peerRecommendations: true, professorEvidenceReview: false,
          })
        : completeOnboarding({
            university, department, title, expertise: splitValues(expertise),
          });
    },
    onSuccess: (data) => {
      if (accessToken) useAuthStore.getState().setSession(accessToken, data.user);
      router.replace(getDashboardPath(data.user.role));
    },
  });

  if (!hydrated || !user || ("onboardingCompleted" in user && user.onboardingCompleted)) return null;
  const isStudent = user.role === "STUDENT";
  const fillRealProfile = () => {
    setUniversity(isStudent ? realStudentProfile.university : realProfessorProfile.university);
    if (isStudent) {
      setFaculty(realStudentProfile.faculty);
      setMajor(realStudentProfile.major);
      setStudyYear(realStudentProfile.studyYear);
      setTargetRole(realStudentProfile.targetRole);
      setInterests(realStudentProfile.interests);
      setSkills(realStudentProfile.skills);
      return;
    }
    setDepartment(realProfessorProfile.department);
    setTitle(realProfessorProfile.title);
    setExpertise(realProfessorProfile.expertise);
  };
  const submitDisabled = mutation.isPending || !university.trim() ||
    (isStudent ? !faculty.trim() || !major.trim() || !targetRole.trim() : !department.trim() || !title.trim());

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(21,101,192,0.12),transparent_35%),#f7fafc] p-5 sm:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-3xl items-center justify-center">
        <Card className="w-full border-border/80 shadow-[0_24px_80px_-42px_rgba(15,42,74,0.55)]">
          <CardContent className="space-y-7 pt-0">
            <BrandMark />
            <div>
              <p className="text-sm font-semibold text-primary">1-qadam · shaxsiy sozlash</p>
              <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-[color:var(--navy)]">
                {isStudent ? "Sizga mos imkoniyatlarni tayyorlaymiz" : "Professor profilingizni to‘ldiring"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {isStudent
                  ? "Profilingiz asosida AI networking, klublar, loyihalar, stajirovkalar va ayniqsa mos ishlarni saralaydi. Keyin bu tavsiyalar o‘qishdagi dalillaringiz bilan yangilanadi."
                  : "Bu ma’lumotlar sizning kurslaringiz, guruh tahlili va o‘qitish tavsiyalarini shaxsiylashtiradi."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); if (!submitDisabled) mutation.mutate(); }}>
              <Button type="button" variant="outline" className="h-10 w-full justify-center text-primary sm:w-auto" onClick={fillRealProfile}>
                <Sparkles data-icon="inline-start" />
                Real profilni avtomatik to‘ldirish
              </Button>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Universitet" value={university} onChange={setUniversity} placeholder="Masalan, TUIT" autoComplete="organization" required />
                <Field label={isStudent ? "Fakultet" : "Kafedra"} value={isStudent ? faculty : department} onChange={isStudent ? setFaculty : setDepartment} placeholder={isStudent ? "Kompyuter injiniringi" : "Dasturiy injiniring"} autoComplete="organization-title" required />
              </div>
              {isStudent ? <StudentFields major={major} setMajor={setMajor} studyYear={studyYear} setStudyYear={setStudyYear} targetRole={targetRole} setTargetRole={setTargetRole} interests={interests} setInterests={setInterests} skills={skills} setSkills={setSkills} /> : <ProfessorFields title={title} setTitle={setTitle} expertise={expertise} setExpertise={setExpertise} />}
              {mutation.isError ? <p role="alert" className="text-sm text-destructive">{mutation.error instanceof ApiError ? "Ma’lumotni tekshirib qayta urinib ko‘ring." : "Onboarding yakunlanmadi. Qayta urinib ko‘ring."}</p> : null}
              <Button className="h-11 w-full" type="submit" disabled={submitDisabled}>
                {mutation.isPending ? "AI tavsiyalarni tayyorlamoqda…" : "Profilni saqlash va davom etish"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, required = false, autoComplete }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean; autoComplete?: string }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} required={required} /></div>;
}

function StudentFields(props: { major: string; setMajor: (value: string) => void; studyYear: string; setStudyYear: (value: string) => void; targetRole: string; setTargetRole: (value: string) => void; interests: string; setInterests: (value: string) => void; skills: string; setSkills: (value: string) => void }) {
  return <>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Mutaxassislik" value={props.major} onChange={props.setMajor} placeholder="Software engineering" required /><div className="space-y-2"><Label htmlFor="study-year">Kurs</Label><Input id="study-year" type="number" min="1" max="12" value={props.studyYear} onChange={(event) => props.setStudyYear(event.target.value)} required /></div></div>
    <Field label="Kasbiy yo‘nalish" value={props.targetRole} onChange={props.setTargetRole} placeholder="Masalan: klinik biologiya, grafik dizayn, xalqaro huquq" required />
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Qiziqishlar" value={props.interests} onChange={props.setInterests} placeholder="AI, fintech, design" /><Field label="Ko‘nikmalar" value={props.skills} onChange={props.setSkills} placeholder="React, Python, SQL" /></div>
    <div className="grid gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground sm:grid-cols-3"><span className="flex items-center gap-2"><BriefcaseBusiness className="size-4 text-primary" /> Jobs</span><span className="flex items-center gap-2"><UsersRound className="size-4 text-primary" /> Networking va klublar</span><span className="flex items-center gap-2"><GraduationCap className="size-4 text-primary" /> Loyiha va stajirovka</span></div>
  </>;
}

function ProfessorFields(props: { title: string; setTitle: (value: string) => void; expertise: string; setExpertise: (value: string) => void }) {
  return <><Field label="Lavozim" value={props.title} onChange={props.setTitle} placeholder="Katta o‘qituvchi" required /><Field label="Ekspertiza" value={props.expertise} onChange={props.setExpertise} placeholder="Machine learning, pedagogika" /><div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground"><Presentation className="size-5 text-primary" /> Kurslar va guruhlar uchun AI tahlili profilingizga moslashtiriladi.</div></>;
}
