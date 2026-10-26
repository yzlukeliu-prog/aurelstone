import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Container, PageIntro } from "@/components/site-shell";
import { VisitBand } from "@/components/visit-band";
import { processSteps, warranties } from "@/lib/site";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "Process — Aurelstone Melbourne" },
      {
        name: "description",
        content:
          "How Aurelstone works: showroom visit, measure, specification, samples, manufacture, and install. Warranties for joinery, SPC, and WPC.",
      },
    ],
  }),
  component: ProcessPage,
});

function ProcessPage() {
  return (
    <>
      <Container className="py-14 md:py-20">
        <PageIntro kicker="Process" title="From the first visit to handover.">
          <p>
            Whole-home work fails when the kitchen is designed in one office
            and the deck in another. This is the sequence we use so the house
            stays in one specification.
          </p>
        </PageIntro>

        <ol className="mt-16 divide-y divide-border border-y border-border">
          {processSteps.map((step) => (
            <li
              key={step.n}
              className="grid gap-4 py-8 md:grid-cols-12 md:items-start md:gap-8 md:py-10"
            >
              <p className="font-display text-2xl text-stone md:col-span-2">
                {step.n}
              </p>
              <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:col-span-4 md:text-3xl">
                {step.title}
              </h2>
              <p className="text-muted md:col-span-6">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>

      <section className="border-t border-border bg-bg-elevated py-16 md:py-20">
        <Container className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
              Warranties, in writing.
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Australian conditions are the point — humidity, UV, pets, and
              pool decks. We do not sell a board we will not stand behind.
            </p>
            <Button asChild className="mt-8">
              <Link to="/enquire">Start a project</Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {warranties.map((w) => (
              <li
                key={w.item}
                className="flex items-baseline justify-between gap-4 py-4"
              >
                <span className="text-fg">{w.item}</span>
                <span className="text-sm text-muted">{w.term}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <VisitBand />
    </>
  );
}
