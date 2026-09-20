import { ContextState } from "@/components/feedback/context-state";
import { Badge } from "@/components/ui/badge";
import { verificationPresentation } from "@/features/opportunities/presentation";
import { t } from "@/i18n";
import type { ProjectEvidence } from "@/types/opportunity";

export function ProjectEvidenceList({
  projects,
  headingLevel = 3,
}: {
  projects: ProjectEvidence[];
  headingLevel?: 3 | 4;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  if (!projects.length)
    return (
      <ContextState
        title="noEvidenceTitle"
        description="noEvidenceDescription"
        headingLevel={headingLevel}
      />
    );
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {projects.map((project) => (
        <article
          className="rounded-xl border border-border bg-card p-5"
          key={project.id}
        >
          <Heading className="font-heading font-semibold">
            {project.title}
          </Heading>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {project.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {t(
                project.collaborative
                  ? "collaborativeProject"
                  : "individualProject",
              )}
            </Badge>
            <Badge
              className={
                verificationPresentation[project.verification].className
              }
              variant="outline"
            >
              {t(verificationPresentation[project.verification].label)}
            </Badge>
          </div>
        </article>
      ))}
    </div>
  );
}
