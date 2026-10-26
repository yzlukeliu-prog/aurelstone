import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SampleForm } from "@/components/enquiry-forms";
import { Button } from "@/components/ui/button";
import { Container, Frame, PageIntro } from "@/components/site-shell";
import { VisitBand } from "@/components/visit-band";
import {
  materials,
  outdoorDisciplines,
  wpcColours,
  type Material,
  type WpcColour,
} from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/outdoor")({
  head: () => ({
    meta: [
      { title: "Outdoor — Aurelstone Melbourne" },
      {
        name: "description",
        content:
          "Five sand-carved WPC colours for Melbourne decks, pool surrounds, and fencing. Ancient Wood, Light Grey, Maple, Teak, and Rosewood.",
      },
    ],
  }),
  component: OutdoorPage,
});

type Lightbox = {
  src: string;
  alt: string;
  title: string;
  fit: "cover" | "contain";
};

function ImageLightbox({
  open,
  onClose,
}: {
  open: Lightbox | null;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    setZoomed(false);
  }, [open?.src]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-hero/90 p-4 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-label={open.title}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 rounded-full bg-surface px-3 py-1 text-sm text-fg shadow-border"
        onClick={onClose}
      >
        Close
      </button>
      <div
        className="flex max-h-full max-w-5xl flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display text-2xl font-medium tracking-tight text-accent-fg">
          {open.title}
        </p>
        <button
          type="button"
          className={cn(
            "overflow-hidden rounded-xl bg-surface",
            open.fit === "contain"
              ? "max-h-[78vh] w-auto max-w-full cursor-zoom-in"
              : "max-h-[78vh] w-full cursor-zoom-in",
            zoomed && "cursor-zoom-out",
          )}
          onClick={() => setZoomed((z) => !z)}
        >
          <img
            src={open.src}
            alt={open.alt}
            className={cn(
              "max-h-[78vh] w-auto max-w-full transition-transform duration-200",
              open.fit === "contain" ? "object-contain" : "h-full w-full object-contain",
              zoomed && "scale-150",
            )}
          />
        </button>
        <p className="text-sm text-accent-fg/70">
          {zoomed ? "Click to pull back" : "Click the board to look closer"}
        </p>
      </div>
    </div>
  );
}

function OutdoorPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<Lightbox | null>(null);

  const selectedMaterials: Material[] = useMemo(
    () =>
      selected
        .map((id) => materials.find((m) => m.id === id))
        .filter((m): m is Material => Boolean(m)),
    [selected],
  );

  function toggleColour(colour: WpcColour) {
    setSelected((prev) => {
      const ids = [colour.deckId, colour.fenceId];
      const on = ids.every((id) => prev.includes(id));
      if (on) return prev.filter((id) => !ids.includes(id));
      return [...new Set([...prev, ...ids])];
    });
  }

  function openBoard(colour: WpcColour) {
    setLightbox({
      src: colour.sample,
      alt: `${colour.name} sand-carved WPC board`,
      title: `${colour.name} · board`,
      fit: "contain",
    });
  }

  function openScene(colour: WpcColour, kind: "deck" | "fence") {
    setLightbox({
      src: kind === "deck" ? colour.deck : colour.fence,
      alt: `${colour.name} WPC ${kind}`,
      title: `${colour.name} · ${kind}`,
      fit: "contain",
    });
  }

  return (
    <>
      <div className="relative h-[48vh] min-h-72 bg-hero md:h-[56vh]">
        <Frame
          src="/images/wpc-teak-deck.jpg"
          alt="Teak WPC decking under a Melbourne pergola"
          className="absolute inset-0"
          priority
        />
        <div className="absolute inset-0 bg-hero/40" />
      </div>
      <Container className="py-14 md:py-20">
        <PageIntro
          kicker="Outdoor living"
          title="The room beyond the glass."
        >
          <p>
            Co-extruded WPC decking and fencing in five sand-carved colours —
            the same boards underfoot and on the boundary, specified against
            the indoor oak and stone.
          </p>
        </PageIntro>

        <section className="mt-14">
          <p className="text-sm tracking-wide text-muted">Colour range</p>
          <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-fg">
            Five colours. Five gardens.
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Each board in a different Melbourne setting. Tap the board to
            enlarge the grain — tap Select to pack samples for Cremorne.
          </p>

          <div className="mt-10 grid gap-10 md:grid-cols-2">
            {wpcColours.map((colour) => {
              const on = selected.includes(colour.deckId);
              return (
                <article key={colour.id} className="text-left">
                  <button
                    type="button"
                    onClick={() => openScene(colour, "deck")}
                    className={cn(
                      "block w-full overflow-hidden rounded-xl bg-hero ring-2 ring-offset-2 ring-offset-bg transition-[box-shadow] duration-150",
                      on ? "ring-accent" : "ring-transparent",
                    )}
                  >
                    <div className="aspect-[16/9]">
                      <Frame
                        src={colour.deck}
                        alt={`${colour.name} WPC deck`}
                      />
                    </div>
                  </button>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <button
                        type="button"
                        onClick={() => openScene(colour, "fence")}
                        className="block w-full overflow-hidden rounded-lg bg-hero"
                      >
                        <div className="aspect-[16/9]">
                          <Frame
                            src={colour.fence}
                            alt={`${colour.name} WPC fence`}
                          />
                        </div>
                      </button>
                      <p className="mt-1.5 text-xs tracking-wide text-muted">
                        Fence
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => openBoard(colour)}
                        className="block w-full overflow-hidden rounded-lg bg-hero"
                      >
                        <div className="aspect-[16/9]">
                          <Frame
                            src={colour.sample}
                            alt={`${colour.name} sample`}
                          />
                        </div>
                      </button>
                      <p className="mt-1.5 text-xs tracking-wide text-muted">
                        Board · tap to enlarge
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl font-medium tracking-tight text-fg">
                        {colour.name}
                      </h3>
                      <p className="text-sm text-muted">{colour.tone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleColour(colour)}
                      aria-pressed={on}
                      className={cn(
                        "mt-1 shrink-0 rounded-full px-3 py-1 text-xs",
                        on
                          ? "bg-accent text-accent-fg"
                          : "bg-surface text-muted shadow-border",
                      )}
                    >
                      {on ? "Selected" : "Select"}
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {colour.note}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </Container>

      {outdoorDisciplines.map((item) => (
        <section key={item.id} id={item.id} className="border-t border-border">
          <Container className="grid items-center gap-10 py-14 md:grid-cols-2 md:gap-16 md:py-20">
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-hero">
              <Frame src={item.image} alt={item.title} />
            </div>
            <div>
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
            </div>
          </Container>
        </section>
      ))}

      <section
        id="samples"
        className="border-t border-border py-14 md:py-20"
      >
        <Container className="grid gap-10 rounded-xl bg-bg-elevated p-6 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight text-fg">
              Request these samples
            </h2>
            <p className="mt-3 text-muted">
              {selected.length
                ? `${selected.length} boards selected. We will confirm collection or delivery.`
                : "Tap Select on a colour, then send your details."}
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              Bring an indoor floor sample to the outdoor bay in Cremorne —
              Teak, Maple, or Light Grey is usually decided in ten minutes
              against the kitchen oak.
            </p>
            <Button asChild variant="secondary" className="mt-6">
              <Link to="/materials">Full material library</Link>
            </Button>
          </div>
          <SampleForm selected={selectedMaterials} />
        </Container>
      </section>
      <VisitBand />
      <ImageLightbox open={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
