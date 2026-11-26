import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, Phone } from "lucide-react";
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
          "Book a Melbourne showroom appointment for joinery, SPC, and WPC samples.",
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
              Full kitchens, wall bays, floor lengths, and an outdoor deck you
              can stand on. The address is given when a visit is booked.
            </p>
          </PageIntro>

          <ul className="mt-10 space-y-5 text-sm">
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
