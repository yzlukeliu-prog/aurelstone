import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function Mark({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block size-5 shrink-0 bg-accent", className)}
      aria-hidden
    >
      <span className="block size-full scale-50 bg-stone" />
    </span>
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:h-[4.5rem] md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="font-display text-xl font-medium tracking-tight text-fg md:text-2xl">
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {nav.map((item) => {
            const active =
              pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "text-sm tracking-wide transition-colors duration-150",
                  active ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/showroom">Book a visit</Link>
          </Button>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md text-fg lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 top-16 z-40 bg-bg lg:hidden">
          <nav
            className="flex h-full flex-col justify-between px-6 pb-10 pt-8"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="font-display text-4xl font-medium leading-tight tracking-tight text-fg"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/enquire"
                className="font-display text-4xl font-medium leading-tight tracking-tight text-fg"
              >
                Enquire
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild size="lg">
                <Link to="/showroom">Book a Cremorne visit</Link>
              </Button>
              <p className="text-sm text-muted">
                {site.showroom.street}, {site.showroom.suburb}
              </p>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
