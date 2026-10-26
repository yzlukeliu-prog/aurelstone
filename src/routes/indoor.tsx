import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Container, Frame, PageIntro } from "@/components/site-shell";
import { VisitBand } from "@/components/visit-band";
import { indoorDisciplines } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/indoor")({
  head: () => ({
    meta: [
      { title: "Indoor — Aurelstone Melbourne" },
      {
        name: "description",
        content:
          "Custom joinery, SPC hybrid flooring, wall panels, and wall protection from the Aurelstone showroom in Cremorne, Melbourne.",
      },
    ],
  }),
  component: IndoorPage,
});

function IndoorPage() {
  return (
    <>
      <Container className="py-14 md:py-20">
        <PageIntro kicker="Indoor living" title="The rooms you live in.">
          <p>
            Joinery, floors, walls, and the protection that keeps a family
            hallway looking finished. Specified as one interior, not a pile of
            brochures.
          </p>
        </PageIntro>
      </Container>

      <div className="pb-8">
        {indoorDisciplines.map((item, i) => (
          <section
            key={item.id}
            id={item.id}
            className="border-t border-border py-14 md:py-20"
          >
            <Container
              className={cn(
                "grid items-center gap-10 md:grid-cols-2 md:gap-16",
              )}
            >
              <div
                className={cn(
                  "overflow-hidden rounded-xl bg-hero",
                  item.id === "joinery" || item.id === "wall-panels"
                    ? "aspect-[16/9]"
                    : "aspect-[4/3]",
                  i % 2 === 1 && "md:order-2",
                )}
              >
                <Frame
                  src={
                    item.id === "joinery"
                      ? "/images/kitchen-custom.jpg"
                      : item.image
                  }
                  alt={item.title}
                />
              </div>
              <div className={cn(i % 2 === 1 && "md:order-1")}>
                <p className="text-sm tracking-wide text-muted">{item.kicker}</p>
                <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
                  {item.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  {item.summary}
                </p>
                <ul className="mt-6 space-y-2 text-sm text-fg">
                  {item.points.map((p) => (
                    <li key={p} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 bg-accent" />
                      {p}
                    </li>
                  ))}
                </ul>
                {item.id === "wall-panels" ? (
                  <div className="mt-8">
                    <Button asChild variant="secondary">
                      <Link to="/panels">Compare the stone looks</Link>
                    </Button>
                  </div>
                ) : null}
              </div>
            </Container>
          </section>
        ))}
      </div>

      <Container className="flex flex-col gap-4 pb-20 sm:flex-row">
        <Button asChild>
          <Link to="/showroom">Book a visit</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/materials">See indoor samples</Link>
        </Button>
      </Container>
      <VisitBand />
    </>
  );
}
