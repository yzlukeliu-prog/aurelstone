import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { VisitForm } from "@/components/enquiry-forms";
import { Container, Frame, PageIntro } from "@/components/site-shell";
import { site } from "@/lib/site";

export const Route = createFileRoute("/showroom")({
  head: () => ({
    meta: [
      { title: "Cremorne Showroom — Aurelstone" },
      {
        name: "description",
        content:
          "Visit Aurelstone at 14 Cubitt Street, Cremorne. Book a Melbourne showroom appointment for joinery, SPC, and WPC samples.",
      },
    ],
  }),
  component: ShowroomPage,
});

function ShowroomPage() {
  return (
    <>
      <div className="relative h-[46vh] min-h-72 bg-hero md:h-[58vh]">
        <Frame
          src="/images/showroom.jpg"
          alt="Aurelstone showroom in Cremorne with sample walls of joinery, floors, and outdoor boards"
          className="absolute inset-0"
          priority
        />
        <div className="absolute inset-0 bg-hero/30" />
      </div>

      <Container className="grid gap-14 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <PageIntro kicker="Cremorne" title="The showroom.">
            <p>
              A converted warehouse floor on Cubitt Street. Full kitchens, wall
              bays, floor lengths, and an outdoor deck you can stand on.
              Parking is on the street; we are a short walk from Richmond
              Station.
            </p>
          </PageIntro>

          <ul className="mt-10 space-y-5 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted" />
              <span>
                <a
                  href={site.mapsUrl}
                  className="text-fg underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {site.showroom.street}, {site.showroom.suburb}{" "}
                  {site.showroom.state} {site.showroom.postcode}
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-muted" />
              <span className="text-muted">
                {site.showroom.hours.map((h) => (
                  <span key={h.days} className="block">
                    {h.days} · {h.time}
                  </span>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-muted" />
              <a href={site.phoneHref} className="text-fg">
                {site.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-muted" />
              <a href={`mailto:${site.email}`} className="text-fg">
                {site.email}
              </a>
            </li>
          </ul>

          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex h-11 items-center rounded-md bg-surface px-4 text-sm text-fg shadow-border transition-colors duration-150 hover:bg-bg-elevated"
          >
            Open in Google Maps
          </a>
        </div>

        <div
          id="visit"
          className="rounded-xl bg-bg-elevated p-6 md:col-span-6 md:col-start-7 md:p-8"
        >
          <h2 className="font-display text-3xl font-medium tracking-tight text-fg">
            Book a visit
          </h2>
          <p className="mt-2 mb-8 text-sm text-muted">
            Tuesday to Saturday. We hold an hour so you can sit with boards in
            daylight.
          </p>
          <VisitForm />
        </div>
      </Container>
    </>
  );
}
