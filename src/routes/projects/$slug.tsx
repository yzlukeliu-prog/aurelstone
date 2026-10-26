import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Container, Frame } from "@/components/site-shell";
import { VisitBand } from "@/components/visit-band";
import { kindLabels, materialById, projectBySlug, projects } from "@/lib/site";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => {
    const project = projectBySlug(params.slug);
    return {
      meta: [
        {
          title: project
            ? `${project.title} — Aurelstone`
            : "Project — Aurelstone",
        },
        {
          name: "description",
          content: project?.summary ?? "Aurelstone project.",
        },
      ],
    };
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const project = projectBySlug(slug);
  if (!project) throw notFound();

  const others = projects.filter((p) => p.slug !== project.slug).slice(0, 2);

  return (
    <>
      <div className="relative h-[52vh] min-h-80 bg-hero md:h-[64vh]">
        <Frame
          src={project.cover}
          alt={project.title}
          className="absolute inset-0"
          priority
        />
        <div className="absolute inset-0 bg-hero/35" />
        <Container className="relative flex h-full flex-col justify-end pb-10 text-hero-fg">
          <p className="text-sm tracking-wide text-stone">
            {project.suburb} · {project.year}
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight md:text-6xl">
            {project.title}
          </h1>
        </Container>
      </div>

      <Container className="grid gap-12 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-7">
          <p className="text-lg leading-relaxed text-muted">{project.story}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {project.rooms.map((room) => (
              <span
                key={room}
                className="rounded-full bg-bg-elevated px-3 py-1 text-sm text-fg"
              >
                {room}
              </span>
            ))}
          </div>
        </div>
        <aside className="md:col-span-4 md:col-start-9">
          <p className="text-sm font-medium text-fg">Materials used</p>
          <ul className="mt-4 space-y-3">
            {project.materialsUsed.map((id) => {
              const m = materialById(id);
              if (!m) return null;
              return (
                <li key={id} className="flex items-center gap-3">
                  <img
                    src={m.image}
                    alt=""
                    className="size-12 rounded-sm object-cover outline outline-1 -outline-offset-1 outline-fg/10"
                  />
                  <span>
                    <span className="block text-sm text-fg">{m.name}</span>
                    <span className="text-xs text-muted">
                      {kindLabels[m.kind]}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <Button asChild className="mt-8" variant="secondary">
            <Link to="/materials">Request these samples</Link>
          </Button>
        </aside>
      </Container>

      <Container className="grid gap-4 pb-16 sm:grid-cols-2">
        {project.gallery.slice(1).map((src) => (
          <div key={src} className="aspect-[4/3] overflow-hidden rounded-xl bg-hero">
            <Frame src={src} alt={`${project.title} interior`} />
          </div>
        ))}
      </Container>

      {others.length ? (
        <Container className="border-t border-border py-16">
          <p className="text-sm tracking-wide text-muted">Further houses</p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            {others.map((p) => (
              <Link
                key={p.slug}
                to="/projects/$slug"
                params={{ slug: p.slug }}
              >
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-hero">
                  <Frame src={p.cover} alt={p.title} />
                </div>
                <p className="mt-3 text-sm text-muted">{p.suburb}</p>
                <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
                  {p.title}
                </h2>
              </Link>
            ))}
          </div>
        </Container>
      ) : null}

      <VisitBand />
    </>
  );
}
