import { Link } from "wouter";
import { Eye, HeartHandshake, Menu, Orbit, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { loadActiveProfile } from "../lib/ActiveProfileRepository";

function profileHref() {
  const result = loadActiveProfile();
  const id = result.profile?.id ?? result.profile?.uuid;
  return id ? `/profile/${id}` : "/create";
}

const linkClass = "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors";

export default function Navigation() {
  const identityHref = profileHref();

  const primaryLinks = [
    { href: identityHref, label: "Identity", icon: UserRound },
    { href: "/timeline", label: "Timeline", icon: Orbit },
    { href: "/compatibility", label: "Compatibility", icon: HeartHandshake },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism transition-transform duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <Eye className="text-primary h-6 w-6" />
            <span className="text-lg sm:text-xl font-bold">Soul Codex</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {primaryLinks.map(({ href, label, icon: Icon }) => (
              <Link key={label} href={href} className={linkClass} data-testid={`link-${label.toLowerCase()}`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
            <Link href="/create">
              <Button className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity" data-testid="button-new-reading">
                New Profile
              </Button>
            </Link>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-5 mt-8">
                {primaryLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={label} href={href} className="flex items-center gap-3 text-foreground font-medium" data-testid={`link-${label.toLowerCase()}-mobile`}>
                    <Icon className="h-5 w-5 text-primary" /> {label}
                  </Link>
                ))}
                <Link href="/create">
                  <Button className="w-full bg-primary text-primary-foreground" data-testid="button-new-profile-mobile">
                    New Profile
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
