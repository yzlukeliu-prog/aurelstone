import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, Frame } from "@/components/site-shell";
import { VisitBand } from "@/components/visit-band";
import {
  indoorDisciplines,
  outdoorDisciplines,
  projects,
  site,
} from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurelstone — Melbourne showroom" },
      { name: "description", content: site.description },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = projects[0]!;
  const disciplines = [
    { ...indoorDisciplines[0]!, href: "/indoor" as const },
    { ...indoorDisciplines[1]!, href: "/indoor" as const },
    { ...indoorDisciplines[2]!, href: "/indoor" as const },
    { ...outdoorDisciplines[0]!, href: "/outdoor" as const },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: site.name,
    description: site.description,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.showroom.street,
      addressLocality: site.showroom.suburb,
      addressRegion: site.showroom.state,
      postalCode: site.showroom.postcode,
      addressCountry: "AU",
    },
    areaServed: "Melbourne",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-paper py-10 md:py-14">
        <Container>
          <figure>
            <img
              src="/images/sofa-wall-a-kept.jpg"
              alt=""
              className="w-full"
            />
          </figure>
        </Container>
      </section>
      <section className="relative min-h-[88vh] bg-hero text-hero-fg">
        <Frame
          src="/images/hero.jpg"
          alt="A Melbourne kitchen opening through glass to a composite deck and garden"
          className="absolute inset-0 h-full w-full"
          priority
        />
        <div className="absolute inset-0 bg-hero/50" />
        <Container className="relative flex min-h-[88vh] flex-col justify-end pb-14 pt-28 md:pb-20">
          <div className="stagger-in max-w-2xl">
            <p className="text-sm tracking-wide text-stone">
              Cremorne, Melbourne
            </p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
              Surfaces for the whole home.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-hero-fg/80">
              Joinery, walls, floors, and the deck beyond the glass — specified
              together from one Melbourne showroom.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="onHero" size="lg">
                <Link to="/showroom">Book a visit</Link>
              </Button>
              <Button asChild variant="onHeroGhost" size="lg">
                <Link to="/projects">See projects</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container className="grid gap-12 md:grid-cols-12 md:gap-16">
          <p className="text-sm tracking-wide text-muted md:col-span-4">
            The showroom
          </p>
          <div className="md:col-span-8">
            <h2 className="font-display text-3xl font-medium leading-snug tracking-tight text-fg md:text-5xl">
              A house reads as one when the kitchen, the hallway, and the
              courtyard share a material story.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Aurelstone is a Cremorne showroom for whole-home surfaces. We
              specify custom joinery, SPC hybrid floors and wall panels, quiet
              wall protection, and outdoor WPC living — so you are not buying
              four products from four catalogues.
            </p>
          </div>
        </Container>
      </section>

      <section className="pb-8">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
              Four disciplines, one palette
            </h2>
            <Link
              to="/materials"
              className="hidden text-sm text-muted hover:text-fg sm:inline-flex"
            >
              Browse materials
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {disciplines.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-hero"
              >
                <Frame
                  src={item.image}
                  alt={item.title}
                  className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-hero/35" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-hero-fg md:p-7">
                  <p className="text-sm text-stone">{item.kicker}</p>
                  <p className="mt-1 font-display text-2xl font-medium md:text-3xl">
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <Link
            to="/projects/$slug"
            params={{ slug: featured.slug }}
            className="block aspect-[4/3] overflow-hidden rounded-xl bg-hero"
          >
            <Frame
              src={featured.cover}
              alt={`${featured.title} in ${featured.suburb}`}
            />
          </Link>
          <div>
            <p className="text-sm tracking-wide text-muted">Featured project</p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-fg md:text-5xl">
              {featured.title}
            </h2>
            <p className="mt-2 text-sm text-subtle">
              {featured.suburb} · {featured.year}
            </p>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              {featured.summary}
            </p>
            <Button asChild className="mt-8" variant="secondary">
              <Link to="/projects/$slug" params={{ slug: featured.slug }}>
                Read the house
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-20 md:py-28">
        <Container>
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
              From the library
            </h2>
            <Link to="/materials" className="text-sm text-muted hover:text-fg">
              All samples
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[
              {
                src: "/images/material-joinery.jpg",
                name: "Pale Oak",
                kind: "Joinery",
              },
              {
                src: "/images/material-floor.jpg",
                name: "French Oak",
                kind: "SPC floor",
              },
              {
                src: "/images/material-fluted.jpg",
                name: "Fluted Limestone",
                kind: "Wall panel",
              },
              {
                src: "/images/material-wpc-teak.jpg",
                name: "Teak",
                kind: "WPC decking",
              },
            ].map((swatch) => (
              <Link
                key={swatch.name}
                to="/materials"
                className="group block"
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-hero">
                  <Frame src={swatch.src} alt={swatch.name} />
                </div>
                <p className="mt-3 font-medium text-fg">{swatch.name}</p>
                <p className="text-sm text-muted">{swatch.kind}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <VisitBand />
    </>
  );
}
