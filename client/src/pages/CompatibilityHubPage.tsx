import { Link } from "wouter";
import Navigation from "../components/navigation";
import { loadActiveProfile } from "../lib/ActiveProfileRepository";
import { Brain, Flame, Heart, Lightbulb, ShieldCheck, Sparkles, Users } from "lucide-react";

const panel: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(23,18,36,.94), rgba(13,10,22,.94))",
  border: "1px solid rgba(212,168,95,.2)",
  borderRadius: 18,
  boxShadow: "0 20px 60px rgba(0,0,0,.28)",
};

function fact(profile: any, keys: string[]) {
  for (const key of keys) {
    const parts = key.split(".");
    let value = profile;
    for (const part of parts) value = value?.[part];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

export default function CompatibilityHubPage() {
  const result = loadActiveProfile();
  const profile = result.profile;

  const name = fact(profile, ["name", "firstName", "codename"]) || "Your";
  const lifePath = fact(profile, ["lifePathNumber", "numerologyData.lifePathNumber", "numerologyData.lifePath"]);
  const hdType = fact(profile, ["humanDesignType", "humanDesignData.type"]);
  const sunSign = fact(profile, ["astrologyData.sun.sign", "astrology.sun.sign"]);
  const profileId = fact(profile, ["id", "uuid"]);

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "#09070f", color: "#f7f0e4" }}>
        <Navigation />
        <main style={{ maxWidth: 760, margin: "0 auto", padding: "130px 18px 80px", textAlign: "center" }}>
          <div style={{ ...panel, padding: "42px 28px" }}>
            <Heart size={34} style={{ color: "#D4A85F", marginBottom: 16 }} />
            <h1 style={{ fontSize: "clamp(2rem,6vw,3.5rem)", margin: "0 0 12px" }}>Compatibility begins with one saved identity.</h1>
            <p style={{ color: "rgba(247,240,228,.68)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 24px" }}>
              Create your Soul Profile once. Compatibility, Timeline, and every future intelligence layer will reuse it instead of making you introduce yourself repeatedly like a malfunctioning reception desk.
            </p>
            <Link href="/create" className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold" style={{ background: "#D4A85F", color: "#140e09" }}>
              Create your Soul Profile
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const summaryFacts = [
    sunSign ? `${sunSign} Sun` : null,
    lifePath ? `Life Path ${lifePath}` : null,
    hdType || null,
  ].filter(Boolean);

  const dimensions = [
    { icon: Heart, title: "Romantic", text: "Trust, attachment, affection, and long-term emotional fit." },
    { icon: Flame, title: "Sexual", text: "Chemistry, intensity, playfulness, safety, and energetic pull." },
    { icon: Brain, title: "Intellectual", text: "Conversation, humor, curiosity, and the ability to build ideas together." },
    { icon: Users, title: "Friendship", text: "Ease, loyalty, reliability, and how naturally daily life flows." },
    { icon: Lightbulb, title: "Growth", text: "Where a connection stretches you, exposes patterns, and develops maturity." },
    { icon: ShieldCheck, title: "Repair", text: "Likely conflict loops, what each person needs, and how trust is restored." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%,rgba(81,45,125,.22),transparent 34%),#09070f", color: "#f7f0e4" }}>
      <Navigation />
      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "112px 18px 80px" }}>
        <header style={{ maxWidth: 760, marginBottom: 30 }}>
          <div style={{ color: "#D4A85F", textTransform: "uppercase", letterSpacing: ".18em", fontSize: 11, marginBottom: 10 }}>Relationship Intelligence</div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.4rem,7vw,4.8rem)", lineHeight: 1.02, margin: "0 0 16px" }}>
            {name} relationship blueprint
          </h1>
          <p style={{ color: "rgba(247,240,228,.68)", lineHeight: 1.7, fontSize: 17, maxWidth: 700 }}>
            Your profile is already loaded. Explore how you connect without rebuilding yourself first.
          </p>
        </header>

        <section style={{ ...panel, padding: 22, marginBottom: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            {summaryFacts.length ? summaryFacts.map((item) => (
              <span key={String(item)} style={{ border: "1px solid rgba(212,168,95,.28)", background: "rgba(212,168,95,.08)", color: "#ead4aa", padding: "7px 11px", borderRadius: 999, fontSize: 13 }}>{item}</span>
            )) : <span style={{ color: "rgba(247,240,228,.56)" }}>Your saved profile is available. Some symbolic layers remain pending verification.</span>}
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Clarity before scoring</h2>
          <p style={{ margin: 0, color: "rgba(247,240,228,.68)", lineHeight: 1.7 }}>
            Compatibility is not one percentage. It is a map of attraction, communication, trust, friction, repair, and growth. Easy does not always mean healthy, and difficult does not always mean wrong.
          </p>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 22 }}>
          {dimensions.map(({ icon: Icon, title, text }) => (
            <article key={title} style={{ ...panel, padding: 18 }}>
              <Icon size={21} style={{ color: "#D4A85F", marginBottom: 12 }} />
              <h3 style={{ margin: "0 0 7px", fontSize: 17 }}>{title}</h3>
              <p style={{ margin: 0, color: "rgba(247,240,228,.62)", lineHeight: 1.55, fontSize: 14 }}>{text}</p>
            </article>
          ))}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          <Link href="/compatibility/explorer" style={{ ...panel, padding: 22, textDecoration: "none", color: "inherit", display: "block", borderColor: "rgba(212,168,95,.4)" }}>
            <Sparkles size={24} style={{ color: "#D4A85F", marginBottom: 13 }} />
            <h2 style={{ margin: "0 0 8px", fontSize: 21 }}>Universal Match Explorer</h2>
            <p style={{ margin: "0 0 14px", color: "rgba(247,240,228,.65)", lineHeight: 1.6 }}>
              See strongest romantic, sexual, intellectual, friendship, growth, easiest-flow, and hardest-lesson matches across all signs.
            </p>
            <strong style={{ color: "#D4A85F" }}>Open your full match map →</strong>
          </Link>

          <div style={{ ...panel, padding: 22 }}>
            <Users size={24} style={{ color: "#a78bfa", marginBottom: 13 }} />
            <h2 style={{ margin: "0 0 8px", fontSize: 21 }}>Compare a specific person</h2>
            <p style={{ margin: "0 0 14px", color: "rgba(247,240,228,.65)", lineHeight: 1.6 }}>
              Your side is already filled. The next pass will ask only for the other person's details and generate one relationship Codex.
            </p>
            <span style={{ color: "rgba(247,240,228,.44)", fontSize: 13 }}>Foundation integration queued</span>
          </div>
        </section>

        {profileId && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Link href={`/profile/${profileId}`} style={{ color: "rgba(247,240,228,.58)", fontSize: 14 }}>Review the saved identity powering this page</Link>
          </div>
        )}
      </main>
    </div>
  );
}
