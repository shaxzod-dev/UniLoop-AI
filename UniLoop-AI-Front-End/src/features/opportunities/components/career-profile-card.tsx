"use client";

import { useRef, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Target } from "lucide-react";
import { MutationFeedback } from "@/components/feedback/mutation-feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateCareerProfile } from "@/features/opportunities/queries";
import { t } from "@/i18n";
import type { CareerProfile } from "@/types/opportunity";

const profileFormSchema = z.object({
  targetRoleId: z
    .string()
    .trim()
    .min(1, t("roleValidation"))
    .max(200, t("roleValidation")),
  interestsText: z.string().refine((value) => {
    const interests = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return (
      interests.length <= 20 && interests.every((item) => item.length <= 100)
    );
  }, t("interestsValidation")),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function CareerProfileCard({ profile }: { profile: CareerProfile }) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateCareerProfile();
  const locked = useRef(false);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      targetRoleId: profile.targetRole,
      interestsText: profile.interests.join(", "),
    },
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    void form.handleSubmit((values) => {
      if (locked.current) return;
      locked.current = true;
      update.mutate(
        {
          targetRole: values.targetRoleId,
          targetRoleId: values.targetRoleId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "general",
          interests: values.interestsText
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        },
        {
          onSuccess: () => setEditing(false),
          onSettled: () => {
            locked.current = false;
          },
        },
      );
    })(event);
  }
  return (
    <Card className="h-full border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle>
            <h2>{t("careerProfile")}</h2>
          </CardTitle>
          <Target aria-hidden="true" className="size-5 shrink-0 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <form className="space-y-4" onSubmit={submit}>
            <p className="text-sm leading-6 text-muted-foreground">
              {t("profileEditorNote")}
            </p>
            <div className="space-y-2">
              <Label htmlFor="career-target-role">{t("targetRole")}</Label>
              <Input
                id="career-target-role"
                disabled={update.isPending}
                aria-invalid={Boolean(form.formState.errors.targetRoleId)}
                aria-describedby="career-role-error"
                {...form.register("targetRoleId")}
              />
              <p id="career-role-error" className="text-sm text-destructive">
                {form.formState.errors.targetRoleId?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="career-interests">{t("interests")}</Label>
              <Input
                id="career-interests"
                disabled={update.isPending}
                className="h-11"
                aria-invalid={Boolean(form.formState.errors.interestsText)}
                aria-describedby="career-interests-hint career-interests-error"
                {...form.register("interestsText")}
              />
              <p
                id="career-interests-hint"
                className="text-xs text-muted-foreground"
              >
                {t("interestsHint")}
              </p>
              <p
                id="career-interests-error"
                className="text-sm text-destructive"
              >
                {form.formState.errors.interestsText?.message}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="min-h-11"
                disabled={update.isPending}
                type="submit"
              >
                {t("actionSave")}
              </Button>
              <Button
                className="min-h-11"
                disabled={update.isPending}
                onClick={() => {
                  setEditing(false);
                  form.reset();
                }}
                type="button"
                variant="outline"
              >
                {t("actionCancel")}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div>
              <p className="text-xs text-muted-foreground">{t("targetRole")}</p>
              <p className="mt-1 font-heading text-xl font-semibold leading-7">
                {profile.targetRole}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("interests")}</p>
              <p className="mt-1 text-sm">
                {profile.interests.join(", ") || "—"}
              </p>
            </div>
            <Button
              className="min-h-11"
              onClick={() => {
                update.reset();
                setEditing(true);
              }}
              type="button"
              variant="outline"
            >
              <Pencil aria-hidden="true" />
              {t("editProfile")}
            </Button>
          </>
        )}
        <MutationFeedback
          pending={update.isPending}
          error={update.isError}
          success={update.isSuccess}
          successMessage="profileSaved"
        />
      </CardContent>
    </Card>
  );
}
