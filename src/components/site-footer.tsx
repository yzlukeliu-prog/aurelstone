import { Link } from "@tanstack/react-router";
import { nav, site } from "@/lib/site";
import { Container } from "@/components/site-shell";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg-elevated">
      <Container className="grid gap-10 py-14 md:grid-cols-4 md:gap-8">
        <div className="md:col-span-2">
          <p className="font-display text-3xl font-medium tracking-tight text-fg">
            {site.name}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {site.tagline} Custom joinery, SPC walls and floors, wall
            protection, and outdoor WPC — from a showroom in Cremorne.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-fg">Visit</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {site.showroom.street}
            <br />
            {site.showroom.suburb} {site.showroom.state} {site.showroom.postcode}
            <br />
            {site.phone}
            <br />
            {site.email}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-fg">Hours</p>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {site.showroom.hours.map((h) => (
              <li key={h.days}>
                {h.days}
                <span className="block text-subtle">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <Container className="flex flex-col gap-4 border-t border-border py-6 text-sm text-subtle md:flex-row md:items-center md:justify-between">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className="hover:text-fg">
              {item.label}
            </Link>
          ))}
          <Link to="/enquire" className="hover:text-fg">
            Enquire
          </Link>
        </nav>
        <p>Melbourne, Australia</p>
      </Container>
    </footer>
  );
}
