import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Frame, PageIntro } from "@/components/site-shell";
import { VisitBand } from "@/components/visit-band";
import { projects } from "@/lib/site";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Aurelstone Melbourne" },
      {
        name: "description",
        content:
          "Melbourne houses where joinery, floors, walls, and outdoor living were specified together. Hawthorn, Kew, Fitzroy, Brighton, Mornington.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <>
      <Container className="py-14 md:py-20">
        <PageIntro kicker="Projects" title="Houses, not catalogues.">
          <p>
            Inner Melbourne and the Peninsula. Each project is a full material
            story — indoor to outdoor — rather than a single room in isolation.
          </p>
        </PageIntro>

        <div className="mt-14 grid gap-10 sm:grid-cols-2">
          {projects.map((project, i) => (
            <Link
              key={project.slug}
              to="/projects/$slug"
              params={{ slug: project.slug }}
              className={i === 0 ? "sm:col-span-2" : undefined}
            >
              <div
                className={
                  i === 0
                    ? "aspect-[16/9] overflow-hidden rounded-xl bg-hero"
                    : "aspect-[4/3] overflow-hidden rounded-xl bg-hero"
                }
              >
                <Frame
                  src={project.cover}
                  alt={`${project.title}, ${project.suburb}`}
                  priority={i === 0}
                />
              </div>
              <p className="mt-4 text-sm text-muted">
                {project.suburb} · {project.year}
              </p>
              <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
                {project.title}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                {project.summary}
              </p>
            </Link>
          ))}
        </div>
      </Container>
      <VisitBand />
    </>
  );
}
