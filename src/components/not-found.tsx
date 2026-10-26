import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/site-shell";

export function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="text-sm tracking-wide text-muted">Page not found</p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-fg md:text-5xl">
        This room isn’t on the drawings.
      </h1>
      <p className="mt-4 max-w-md text-muted">
        The page may have moved. Come back to the showroom floor.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/showroom">Book a visit</Link>
        </Button>
      </div>
    </Container>
  );
}
