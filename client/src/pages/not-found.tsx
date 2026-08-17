import { Link } from "wouter";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="sc-app-shell flex min-h-screen w-full items-center justify-center px-4">
      <div className="sc-panel sc-panel-gold max-w-md p-8 text-center">
        <span className="sc-icon-well mx-auto mb-5"><Compass className="h-5 w-5" /></span>
        <p className="sc-eyebrow justify-center">Off the map</p>
        <h1 className="mt-2 font-serif text-3xl font-medium text-[var(--sc-ivory)]">This page does not exist.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
          The link may be outdated, or the page may have moved. Your saved profile and reading are unaffected.
        </p>
        <Link href="/" className="sc-button-primary mt-6 justify-center">Return home</Link>
      </div>
    </div>
  );
}
