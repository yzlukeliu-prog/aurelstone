import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/site-shell";
import { site } from "@/lib/site";

export function VisitBand() {
  return (
    <section className="bg-hero text-hero-fg">
      <Container className="flex flex-col gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-20">
        <div className="max-w-xl">
          <p className="text-sm tracking-wide text-stone">Cremorne showroom</p>
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight md:text-5xl">
            Sit with the samples. Take what you need home.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone">
            {site.showroom.street}, {site.showroom.suburb}. Tuesday to Saturday,
            or by appointment.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="onHero" size="lg">
            <Link to="/showroom">Book a visit</Link>
          </Button>
          <Button asChild variant="onHeroGhost" size="lg">
            <Link to="/enquire">Enquire about a project</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
