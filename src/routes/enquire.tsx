import { createFileRoute } from "@tanstack/react-router";
import { QuoteForm } from "@/components/enquiry-forms";
import { Container, PageIntro } from "@/components/site-shell";
import { site } from "@/lib/site";

export const Route = createFileRoute("/enquire")({
  head: () => ({
    meta: [
      { title: "Enquire — Aurelstone Melbourne" },
      {
        name: "description",
        content:
          "Enquire about custom joinery, SPC floors and walls, or outdoor WPC for a Melbourne home. Aurelstone, Cremorne.",
      },
    ],
  }),
  component: EnquirePage,
});

function EnquirePage() {
  return (
    <Container className="grid gap-14 py-14 md:grid-cols-12 md:py-20">
      <div className="md:col-span-5">
        <PageIntro kicker="Enquire" title="Tell us about the house.">
          <p>
            New build, renovation, or a single room that has to set the rest of
            the palette. Send the suburb and what you already know — we will
            come back with a showroom time.
          </p>
        </PageIntro>
        <p className="mt-8 text-sm text-muted">
          Prefer the phone?{" "}
          <a href={site.phoneHref} className="text-fg underline-offset-4 hover:underline">
            {site.phone}
          </a>
          <br />
          Or {site.email}
        </p>
      </div>
      <div className="rounded-xl bg-bg-elevated p-6 md:col-span-6 md:col-start-7 md:p-8">
        <QuoteForm />
      </div>
    </Container>
  );
}
