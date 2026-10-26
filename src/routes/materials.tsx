import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SampleForm } from "@/components/enquiry-forms";
import { Container, Frame, PageIntro } from "@/components/site-shell";
import {
  kindLabels,
  materials,
  type Material,
  type MaterialKind,
  type MaterialRealm,
} from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/materials")({
  head: () => ({
    meta: [
      { title: "Materials — Aurelstone Melbourne" },
      {
        name: "description",
        content:
          "Joinery, SPC floors and wall panels, wall protection, and WPC outdoor boards. Request samples from the Cremorne showroom.",
      },
    ],
  }),
  component: MaterialsPage,
});

const realmFilters: { id: "all" | MaterialRealm; label: string }[] = [
  { id: "all", label: "All" },
  { id: "indoor", label: "Indoor" },
  { id: "outdoor", label: "Outdoor" },
];

const kindFilters: { id: "all" | MaterialKind; label: string }[] = [
  { id: "all", label: "Every type" },
  { id: "joinery", label: "Joinery" },
  { id: "floor", label: "Floors" },
  { id: "wall-panel", label: "Wall panels" },
  { id: "wall-protection", label: "Protection" },
  { id: "decking", label: "Decking" },
  { id: "fencing", label: "Fencing" },
];

function MaterialsPage() {
  const [realm, setRealm] = useState<"all" | MaterialRealm>("all");
  const [kind, setKind] = useState<"all" | MaterialKind>("all");
  const [selected, setSelected] = useState<string[]>([]);

  const visible = useMemo(
    () =>
      materials.filter((m) => {
        if (realm !== "all" && m.realm !== realm) return false;
        if (kind !== "all" && m.kind !== kind) return false;
        return true;
      }),
    [realm, kind],
  );

  const selectedMaterials: Material[] = selected
    .map((id) => materials.find((m) => m.id === id))
    .filter((m): m is Material => Boolean(m));

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <Container className="py-14 md:py-20">
      <PageIntro kicker="Material library" title="Boards you can take home.">
        <p>
          Select the finishes you want to live with. We will pack a small set
          for collection in Cremorne, or send them if you are further out.
        </p>
      </PageIntro>

      <div className="mt-10 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {realmFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setRealm(f.id)}
              className={cn(
                "h-11 rounded-full px-4 text-sm transition-colors duration-150",
                realm === f.id
                  ? "bg-accent text-accent-fg"
                  : "bg-surface text-fg shadow-border hover:bg-bg-elevated",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {kindFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setKind(f.id)}
              className={cn(
                "h-11 rounded-full px-4 text-sm transition-colors duration-150",
                kind === f.id
                  ? "bg-accent text-accent-fg"
                  : "bg-surface text-fg shadow-border hover:bg-bg-elevated",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {visible.map((m) => {
          const on = selected.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              aria-pressed={on}
              className={cn(
                "group text-left transition-transform duration-150",
                on && "scale-[0.99]",
              )}
            >
              <div
                className={cn(
                  "aspect-square overflow-hidden rounded-lg bg-hero ring-2 ring-offset-2 ring-offset-bg transition-[box-shadow] duration-150",
                  on ? "ring-accent" : "ring-transparent",
                )}
              >
                <Frame src={m.image} alt={m.name} />
              </div>
              <p className="mt-3 font-medium text-fg">{m.name}</p>
              <p className="text-sm text-muted">
                {kindLabels[m.kind]} · {m.tone}
              </p>
            </button>
          );
        })}
      </div>

      <section
        id="samples"
        className="mt-16 grid gap-10 rounded-xl bg-bg-elevated p-6 md:grid-cols-2 md:p-10"
      >
        <div>
          <h2 className="font-display text-3xl font-medium tracking-tight text-fg">
            Request samples
          </h2>
          <p className="mt-3 text-muted">
            {selected.length
              ? `${selected.length} selected. We will confirm collection or delivery.`
              : "Tap the boards above, then send your details."}
          </p>
        </div>
        <SampleForm selected={selectedMaterials} />
      </section>
    </Container>
  );
}
