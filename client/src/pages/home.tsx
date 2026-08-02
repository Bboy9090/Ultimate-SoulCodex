import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { loadActiveProfile } from "../lib/ActiveProfileRepository";
import { ArrowRight, BookOpen, HeartHandshake, Orbit, ShieldCheck, Sparkles, UserRound } from "lucide-react";

const panel: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(23,18,36,.94), rgba(13,10,22,.94))",
  border: "1px solid rgba(212,168,95,.2)",
  borderRadius: 18,
  boxShadow: "0 22px 70px rgba(0,0,0,.3)",
};

function getProfileIdentity(profile: any) {
  const id = profile?.id ?? profile?.uuid;
  const name = profile?.name ?? profile?.firstName ?? "there";
  return { id, name };
}

export default function Home() {
  const result = loadActiveProfile();
  const profile = result.profile;
  const { id, name } = getProfileIdentity(profile);
  const identityHref = id ? `/profile/${id}` : "/create";

  const destinations = [
    {
      href: identityHref,
      icon: UserRound,
      title: "Identity",
      question: "Who am I?",
      description: "Your saved facts, calculated systems, and verification status in one place.",
    },
    {
      href: identityHref,
      icon: BookOpen,
      title: "Reading",
      question: "How do I operate?",
      description: "The clearest explanation of your core pattern, gift, cost, and next move.",
    },
    {
      href: "/timeline",
      icon: Orbit,
      title: "Timeline",
      question: "Where am I now?",
      description: "Your current numerology cycle, focus, watch points, and timing context.",
    },
    {
      href: "/compatibility",
      icon: HeartHandshake,
      title: "Compatibility",
      question: "How do I connect?",
      description: "Romantic, sexual, intellectual, friendship, friction, repair, and growth patterns.",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", color: "#f7f0e4", background: "radial-gradient(circle at 50% -10%,rgba(88,52,140,.26),transparent 36%),#09070f" }}>
      <Navigation />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "118px 18px 80px" }}>
        <section style={{ maxWidth: 820, marginBottom: 34 }}>
          <div style={{ color: "#D4A85F", textTransform: "uppercase", letterSpacing: ".18em", fontSize: 11, marginBottom: 12 }}>
            Project Clarity
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.7rem,8vw,5.7rem)", lineHeight: .98, margin: "0 0 20px" }}>
            {profile ? `Good to see you, ${name}.` : "Understand yourself without drowning in labels."}
          </h1>
          <p style={{ maxWidth: 720, color: "rgba(247,240,228,.68)", fontSize: "clamp(1rem,2.5vw,1.25rem)", lineHeight: 1.75, margin: 0 }}>
            Soul Codex exists to give you clarity: what pattern is operating, why it matters, what it costs, and what to do next.
          </p>
        </section>

        <section style={{ ...panel, padding: "clamp(22px,5vw,38px)", marginBottom: 24, borderColor: "rgba(212,168,95,.36)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", color: "#D4A85F", marginBottom: 13 }}>
            <Sparkles size={20} />
            <span style={{ textTransform: "uppercase", letterSpacing: ".12em", fontSize: 11, fontWeight: 700 }}>Today's clarity</span>
          </div>
          <blockquote style={{ margin: "0 0 20px", fontFamily: "var(--font-serif)", fontSize: "clamp(1.55rem,4vw,2.6rem)", lineHeight: 1.25 }}>
            “You do not need more information. You need to know what matters.”
          </blockquote>
          <p style={{ color: "rgba(247,240,228,.66)", lineHeight: 1.7, margin: "0 0 22px", maxWidth: 720 }}>
            Choose one insight, one action, and one thing to finish before adding another layer. Depth should create clarity, not bury it.
          </p>
          <Link href={identityHref} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold" style={{ background: "#D4A85F", color: "#140e09", textDecoration: "none" }}>
            {profile ? "Continue your Codex" : "Create your Soul Profile"} <ArrowRight size={17} />
          </Link>
        </section>

        <section aria-label="Soul Codex destinations" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 15, marginBottom: 24 }}>
          {destinations.map(({ href, icon: Icon, title, question, description }) => (
            <Link key={title} href={href} style={{ ...panel, padding: 20, color: "inherit", textDecoration: "none", display: "block" }}>
              <Icon size={22} style={{ color: "#D4A85F", marginBottom: 14 }} />
              <div style={{ color: "rgba(247,240,228,.48)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>{title}</div>
              <h2 style={{ margin: "0 0 9px", fontSize: 20 }}>{question}</h2>
              <p style={{ margin: 0, color: "rgba(247,240,228,.62)", lineHeight: 1.6, fontSize: 14 }}>{description}</p>
            </Link>
          ))}
        </section>

        <section style={{ ...panel, padding: 20, display: "flex", gap: 15, alignItems: "flex-start" }}>
          <ShieldCheck size={24} style={{ color: "#5eead4", flexShrink: 0, marginTop: 2 }} />
          <div>
            <h2 style={{ margin: "0 0 7px", fontSize: 18 }}>Evidence stays available, but it no longer hijacks the reading.</h2>
            <p style={{ margin: 0, color: "rgba(247,240,228,.62)", lineHeight: 1.65, fontSize: 14 }}>
              The human message comes first. Verification, provenance, uncertainty, and technical detail remain inspectable when you need them.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
