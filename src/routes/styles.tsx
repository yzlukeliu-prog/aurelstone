import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Frame, PageIntro } from "@/components/site-shell";
import { styleLibrary } from "@/lib/style-library";

export const Route = createFileRoute("/styles")({
  head: () => ({
    meta: [
      { title: "Styles — Aurelstone Melbourne" },
      {
        name: "description",
        content:
          "Aurelstone's own style library: warm minimal, quiet luxury, Japandi, new Chinese, cream, coastal, and more. Specified with our joinery, SPC, and WPC.",
      },
    ],
  }),
  component: StylesPage,
});

function StylesPage() {
  return (
    <Container className="py-14 md:py-20">
      <PageIntro kicker="Style library" title="Twelve ways to specify the house.">
        <p>
          Built from a 35-style taxonomy, edited for Melbourne rooms and the
          boards in this showroom. Not a catalogue of other people's pictures.
        </p>
      </PageIntro>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        {styleLibrary.map((style) => (
          <article key={style.id} className="overflow-hidden rounded-xl bg-surface">
            <div className="aspect-[16/10] overflow-hidden bg-hero">
              <Frame src={style.image} alt={style.name} />
            </div>
            <div className="p-5 md:p-6">
              <p className="text-sm text-muted">{style.zh}</p>
              <h2 className="mt-1 font-display text-3xl font-medium tracking-tight">
                {style.name}
              </h2>
              <p className="mt-3 text-muted">{style.summary}</p>
              <p className="mt-4 text-sm">
                <span className="text-muted">Palette </span>
                {style.palette.join(" · ")}
              </p>
              <p className="mt-1 text-sm">
                <span className="text-muted">Boards </span>
                {style.materials.join(" · ")}
              </p>
              <p className="mt-1 text-sm">
                <span className="text-muted">Rooms </span>
                {style.spaces.join(" · ")}
              </p>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-12 text-sm text-muted">
        Want one of these for a house?{" "}
        <Link to="/enquire" className="text-fg underline-offset-4 hover:underline">
          Send the suburb and the rooms.
        </Link>
      </p>
    </Container>
  );
}
