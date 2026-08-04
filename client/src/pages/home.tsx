import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { loadActiveProfile } from "../lib/ActiveProfileRepository";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Orbit,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

const panel: React.CSSProperties = {
  background:
    "linear-gradient(145deg, rgba(25,17,43,.94), rgba(11,8,20,.96))",
  border: "1px solid rgba(214,171,94,.22)",
  borderRadius: 20,
  boxShadow: "0 24px 80px rgba(0,0,0,.34)",
  backdropFilter: "blur(18px)",
};

function getProfileIdentity(profile: any) {
  const id = profile?.id ?? profile?.uuid;
  const name = profile?.name ?? profile?.codename ?? profile?.firstName ?? "there";
  return { id, name };
}

export default function Home() {
  const result = loadActiveProfile();
  const profile = result.profile;
  const { id, name } = getProfileIdentity(profile);
  const identityHref = id ? `/profile/${id}` : "/create";
  const readingHref = id ? `/reading/${id}` : "/create";

  const destinations = [
    {
      href: identityHref,
      icon: UserRound,
      title: "Identity",
      question: "Who am I?",
      description:
        "Your saved facts, calculated systems, and verification status in one calm place.",
    },
    {
      href: readingHref,
      icon: BookOpen,
      title: "Reading",
      question: "Why do I operate this way?",
      description:
        "Your pattern, protective function, hidden need, gift, cost, and grounded next move.",
    },
    {
      href: "/timeline",
      icon: Orbit,
      title: "Timeline",
      question: "Where am I now?",
      description:
        "Your current cycle, pressure points, focus, and timing context without false certainty.",
    },
    {
      href: "/compatibility",
      icon: HeartHandshake,
      title: "Compatibility",
      question: "How do I connect?",
      description:
        "Connection, friction, communication, repair, and growth patterns beyond a score.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "#f8f1e7",
        background:
          "radial-gradient(circle at 50% -15%, rgba(111,65,174,.34), transparent 38%), radial-gradient(circle at 88% 28%, rgba(45,91,156,.16), transparent 30%), linear-gradient(180deg,#090610 0%,#0d0917 50%,#08060d 100%)",
      }}
    >
      <Navigation />

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "116px 18px 84px" }}>
        <section style={{ maxWidth: 900, marginBottom: 34 }}>
          <div
            style={{
              color: "#d6ab5e",
              textTransform: "uppercase",
              letterSpacing: ".2em",
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Soul Codex · Clarity Engine
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.8rem,8vw,6rem)",
              lineHeight: .96,
              letterSpacing: "-.035em",
              margin: "0 0 22px",
              maxWidth: 980,
            }}
          >
            {profile
              ? `Good to see you, ${name}. Let’s go deeper.`
              : "Understand yourself without drowning in labels."}
          </h1>
          <p
            style={{
              maxWidth: 760,
              color: "rgba(248,241,231,.7)",
              fontSize: "clamp(1rem,2.5vw,1.24rem)",
              lineHeight: 1.78,
              margin: 0,
            }}
          >
            Soul Codex explains what pattern is operating, what it protects, what it costs,
            what gift lives inside it, and what you can consciously do next.
          </p>
        </section>

        <section
          style={{
            ...panel,
            position: "relative",
            overflow: "hidden",
            padding: "clamp(24px,5vw,42px)",
            marginBottom: 24,
            borderColor: "rgba(214,171,94,.4)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 88% 12%, rgba(136,78,204,.22), transparent 32%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                color: "#d6ab5e",
                marginBottom: 14,
              }}
            >
              <Sparkles size={20} />
              <span
                style={{
                  textTransform: "uppercase",
                  letterSpacing: ".14em",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Today’s clarity
              </span>
            </div>
            <blockquote
              style={{
                margin: "0 0 18px",
                maxWidth: 860,
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.6rem,4vw,2.75rem)",
                lineHeight: 1.22,
              }}
            >
              “You do not need more labels. You need to understand what matters.”
            </blockquote>
            <p
              style={{
                color: "rgba(248,241,231,.67)",
                lineHeight: 1.72,
                margin: "0 0 24px",
                maxWidth: 760,
              }}
            >
              Choose one insight, one honest correction, and one action small enough to test.
              Depth should create clarity, not bury it.
            </p>
            <Link
              href={profile ? readingHref : identityHref}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition-transform hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg,#e0bb72,#c9943f)",
                color: "#160f08",
                textDecoration: "none",
                boxShadow: "0 12px 34px rgba(214,171,94,.2)",
              }}
            >
              {profile ? "Continue your clarity reading" : "Create your Soul Profile"}
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section
          aria-label="Soul Codex destinations"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(235px,1fr))",
            gap: 15,
            marginBottom: 24,
          }}
        >
          {destinations.map(({ href, icon: Icon, title, question, description }) => (
            <Link
              key={title}
              href={href}
              className="transition-transform hover:-translate-y-1"
              style={{
                ...panel,
                minHeight: 210,
                padding: 22,
                color: "inherit",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Icon size={23} style={{ color: "#d6ab5e", marginBottom: 18 }} />
              <div
                style={{
                  color: "rgba(248,241,231,.46)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: ".14em",
                  marginBottom: 7,
                }}
              >
                {title}
              </div>
              <h2 style={{ margin: "0 0 10px", fontSize: 21 }}>{question}</h2>
              <p
                style={{
                  margin: 0,
                  color: "rgba(248,241,231,.64)",
                  lineHeight: 1.62,
                  fontSize: 14,
                }}
              >
                {description}
              </p>
            </Link>
          ))}
        </section>

        <section
          style={{
            ...panel,
            padding: 22,
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          <ShieldCheck size={25} style={{ color: "#70dfcf", flexShrink: 0, marginTop: 2 }} />
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>
              The human message comes first. The evidence stays inspectable.
            </h2>
            <p
              style={{
                margin: 0,
                color: "rgba(248,241,231,.63)",
                lineHeight: 1.68,
                fontSize: 14,
              }}
            >
              Verified facts, inferences, uncertainty, missing data, and limitations remain visible.
              Soul Codex will not silently turn a possibility into a fact or a symbolic pattern into
              a biography.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
