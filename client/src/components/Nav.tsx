import { Link, useLocation } from "wouter";

export default function Nav() {
  const [location] = useLocation();

  const links = [
    { href: "/",        label: "Start"   },
    { href: "/profile", label: "Profile" },
    { href: "/codex",   label: "Codex"   },
    { href: "/horoscope", label: "Daily" },
    { href: "/poster",  label: "Poster"  },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link href="/" className="navbar-brand">
          <span style={{ fontSize: "1.5rem" }}>✦</span>
          Soul Codex
        </Link>
        <div className="navbar-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`btn btn-ghost${location === link.href ? " active-nav" : ""}`}
              style={{
                fontSize: "0.875rem",
                padding: "0.5rem 1rem",
                color: location === link.href ? "var(--cosmic-lavender)" : "var(--muted-foreground)",
                borderBottom: location === link.href ? "2px solid var(--cosmic-purple)" : "2px solid transparent",
                borderRadius: 0,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
