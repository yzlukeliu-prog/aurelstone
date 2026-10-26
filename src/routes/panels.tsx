import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SampleForm } from "@/components/enquiry-forms";
import { Button } from "@/components/ui/button";
import { Container, Frame, PageIntro } from "@/components/site-shell";
import {
  materials,
  wallPanelSamples,
  type Material,
  type WallPanelSample,
} from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/panels")({
  head: () => ({
    meta: [
      { title: "Wall panel samples — Aurelstone Melbourne" },
      {
        name: "description",
        content:
          "Ten SPC wall rooms on one page: television walls, sofa walls, and bathrooms, including the sage bathroom. Request samples from Cremorne.",
      },
    ],
  }),
  component: PanelsPage,
});

function PanelGrid({
  panels,
  selected,
  onToggle,
}: {
  panels: WallPanelSample[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      {panels.map((panel) => {
        const on = selected.includes(panel.id);
        return (
          <button
            key={panel.id}
            type="button"
            onClick={() => onToggle(panel.id)}
            aria-pressed={on}
            className={cn(
              "group text-left",
              panel.scenes?.length && "md:col-span-2",
            )}
          >
            <div
              className={cn(
                "overflow-hidden rounded-xl bg-hero ring-2 ring-offset-2 ring-offset-bg transition-[box-shadow] duration-150",
                panel.id === "f1141" || panel.id === "4z024"
                  ? "aspect-[3/2]"
                  : "aspect-[16/9]",
                on ? "ring-accent" : "ring-transparent",
              )}
            >
              <Frame src={panel.room} alt={`${panel.name} feature wall`} />
            </div>
            {panel.scenes?.length ? (
              <div
                className={cn(
                  "mt-3 grid gap-2",
                  panel.scenes.length >= 3
                    ? "grid-cols-3"
                    : "md:grid-cols-2",
                )}
              >
                {panel.scenes.map((scene) => (
                  <div key={scene.src}>
                    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-hero">
                      <Frame src={scene.src} alt={scene.label} />
                    </div>
                    <p className="mt-1.5 text-xs tracking-wide text-muted">
                      {scene.label}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm tracking-wide text-muted">{panel.sku}</p>
                <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-fg">
                  {panel.name}
                </h2>
                <p className="text-sm text-muted">
                  {panel.tone} · {panel.use}
                </p>
              </div>
              <span
                className={cn(
                  "mt-1 shrink-0 rounded-full px-3 py-1 text-xs",
                  on
                    ? "bg-accent text-accent-fg"
                    : "bg-surface text-muted shadow-border",
                )}
              >
                {on ? "Selected" : "Select"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {panel.note}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function PanelsPage() {
  const [selected, setSelected] = useState<string[]>([]);

  const selectedMaterials: Material[] = useMemo(
    () =>
      selected
        .map((id) => materials.find((m) => m.id === id.replace(/-tv$/, "")))
        .filter((m): m is Material => Boolean(m)),
    [selected],
  );

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <Container className="py-14 md:py-20">
      <PageIntro kicker="SPC wall panels" title="Ten walls, one page.">
        <p>
          Television walls, sofa walls, and bathrooms. Tap a wall to
          request samples from Cremorne.
        </p>
      </PageIntro>

      {(
        [
          ["Television wall", "Television walls"],
          ["Sofa wall", "Sofa walls"],
          ["Bathroom", "Bathrooms"],
        ] as const
      ).map(([use, title]) => (
        <section key={use} className="mt-14">
          <h2 className="font-display text-3xl font-medium tracking-tight text-fg">
            {title}
          </h2>
          <PanelGrid
            panels={wallPanelSamples.filter((p) => p.use === use)}
            selected={selected}
            onToggle={toggle}
          />
        </section>
      ))}

      <section
        id="samples"
        className="mt-16 grid gap-10 rounded-xl bg-bg-elevated p-6 md:grid-cols-2 md:p-10"
      >
        <div>
          <h2 className="font-display text-3xl font-medium tracking-tight text-fg">
            Request these samples
          </h2>
          <p className="mt-3 text-muted">
            {selected.length
              ? `${selected.length} selected. We will confirm collection or delivery.`
              : "Tap the walls above, then send your details."}
          </p>
          <Button asChild variant="secondary" className="mt-6">
            <Link to="/materials">Full material library</Link>
          </Button>
        </div>
        <SampleForm selected={selectedMaterials} />
      </section>
    </Container>
  );
}
