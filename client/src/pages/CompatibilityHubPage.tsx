import { Link } from "wouter";
import Navigation from "../components/navigation";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { ArrowRight, Flame, Heart, MessagesSquare, Orbit, ShieldCheck, Sparkles, Users } from "lucide-react";

function fact(profile: any, keys: string[]) {
  for (const key of keys) {
    const parts = key.split(".");
    let value = profile;
    for (const part of parts) value = value?.[part];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

const dimensions = [
  { icon: Heart, title: "Romantic connection", text: "Partnership themes, trust, steadiness, and long-range symbolic flow." },
  { icon: Flame, title: "Chemistry & attraction", text: "Magnetism, activation, intensity, play, and attraction in the symbolic model." },
  { icon: MessagesSquare, title: "Communication & friendship", text: "Conversation, curiosity, humor, social ease, and day-to-day rapport." },
  { icon: ShieldCheck, title: "Growth & repair", text: "Friction, adaptation, recurring lessons, repair pressure, and development themes." },
];

export default function CompatibilityHubPage() {
  const { profile, isLoading } = useActiveProfile();

  if (isLoading) {
    return <div className="sc-app-shell"><Navigation /><main className="sc-page pt-32"><div className="sc-panel p-8 text-center text-[var(--sc-stone)]">Loading saved Identity…</div></main></div>;
  }

  if (!profile) {
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="sc-relationship-main sc-relationship-empty">
          <section className="sc-relationship-empty-card">
            <div className="sc-orbit-mark" aria-hidden="true"><Heart size={28} /></div>
            <p className="sc-kicker">Relationship Intelligence</p>
            <h1>Compatibility starts with one saved Identity.</h1>
            <p>Create a profile once. Compatibility reuses only the supported fields instead of asking you to rebuild yourself on every screen.</p>
            <Link href="/create" className="sc-primary-link">Create profile <ArrowRight size={16} /></Link>
          </section>
        </main>
        <style>{styles}</style>
      </div>
    );
  }

  const name = fact(profile, ["name", "firstName", "codename"]) || "Your";
  const lifePath = fact(profile, ["lifePathNumber", "numerologyData.lifePathNumber", "numerologyData.lifePath"]);
  const sunSign = fact(profile, ["astrologyData.sun.sign", "astrology.sun.sign", "astrologyData.sunSign", "sunSign", "astrologyData.sun.internalCandidate.sign"]);
  const profileId = fact(profile, ["id", "uuid"]);
  const modelFacts = [sunSign ? `${sunSign} Sun` : null, lifePath ? `Life Path ${lifePath}` : null].filter(Boolean);

  return (
    <div className="sc-page-shell">
      <Navigation />
      <main className="sc-relationship-main">
        <header className="sc-relationship-hero">
          <div className="sc-relationship-copy">
            <p className="sc-kicker">Relationship Intelligence</p>
            <h1>{name} relationship map</h1>
            <p className="sc-relationship-lede">Compatibility is not a magic percentage. Soul Codex keeps four relationship dimensions separate so one loud signal cannot impersonate the whole bond.</p>
            <div className="sc-identity-pills" aria-label="Foundation Compatibility inputs">
              {modelFacts.length ? modelFacts.map((item) => <span key={String(item)}>{item}</span>) : <span>Saved Identity available</span>}
            </div>
            <p className="sc-input-boundary">Moon, Rising, houses, and Human Design may exist elsewhere in Identity, but they are <strong>not used in Foundation Compatibility.</strong></p>
          </div>
          <div className="sc-relationship-orbit" aria-hidden="true">
            <div className="sc-orbit-ring" /><div className="sc-orbit-ring sc-orbit-ring-two" />
            <div className="sc-orbit-core"><Heart size={30} /></div>
            <span className="sc-orbit-node sc-node-one" /><span className="sc-orbit-node sc-node-two" /><span className="sc-orbit-node sc-node-three" />
          </div>
        </header>

        <section className="sc-relationship-principle">
          <div className="sc-principle-icon"><Orbit size={20} /></div>
          <div><p className="sc-kicker">Clarity before scoring</p><h2>Easy is not always healthy. Difficult is not always wrong.</h2><p>The useful question is where a symbolic model expects flow, where it expects friction, and what deserves closer reflection in lived experience.</p></div>
        </section>

        <section className="sc-dimension-grid" aria-label="Compatibility dimensions">
          {dimensions.map(({ icon: Icon, title, text }, index) => (
            <article className="sc-dimension-card" key={title}>
              <div className="sc-dimension-card-inner"><div className="sc-dimension-number">0{index + 1}</div><Icon size={20} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></div>
            </article>
          ))}
        </section>

        <section className="sc-relationship-actions">
          <Link href="/compatibility/explorer" className="sc-action-card">
            <div className="sc-action-card-inner"><div className="sc-action-icon"><Sparkles size={22} /></div><p className="sc-kicker">Explore patterns</p><h2>Universal Match Explorer</h2><p>Compare all 12 signs across the same four dimensions, with symbolic score labels and evidence limits kept visible.</p><strong>Open match explorer <ArrowRight size={16} /></strong></div>
          </Link>
          <Link href="/compatibility/compare" className="sc-action-card" data-testid="compatibility-compare-person">
            <div className="sc-action-card-inner"><div className="sc-action-icon sc-action-icon-violet"><Users size={22} /></div><p className="sc-kicker">Person to person</p><h2>Compare a specific person</h2><p>Your Identity stays loaded. Add only the other person’s name and symbolic Sun sign, then inspect the same four dimensions.</p><strong>Compare one person <ArrowRight size={16} /></strong></div>
          </Link>
        </section>

        <aside className="sc-honesty-note"><ShieldCheck size={18} /><p><strong>Evidence boundary:</strong> symbolic systems can organize reflection but do not prove relationship outcomes. Missing or unverified data reduces scope instead of increasing certainty.</p></aside>
        {profileId && <div className="sc-relationship-footer-link"><Link href={`/profile/${profileId}`}>Review the saved Identity powering this page <ArrowRight size={14} /></Link></div>}
      </main>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
.sc-page-shell{min-height:100vh;color:var(--sc-ivory);background:radial-gradient(circle at 74% 6%,rgba(154,116,220,.16),transparent 27%),radial-gradient(circle at 13% 24%,rgba(100,151,217,.09),transparent 25%),linear-gradient(180deg,var(--sc-void),#0b0813 52%,#07060b)}.sc-relationship-main{width:min(1120px,calc(100% - 32px));margin:auto;padding:118px 0 84px}.sc-relationship-hero{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(260px,.6fr);gap:48px;align-items:center;padding:34px 0 38px}.sc-kicker{margin:0 0 10px;color:var(--sc-gold);font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.sc-relationship-copy h1,.sc-relationship-empty-card h1{margin:0;font-family:var(--font-serif);font-size:clamp(2.75rem,7vw,5.8rem);font-weight:500;line-height:.98;letter-spacing:-.04em}.sc-relationship-lede,.sc-relationship-empty-card>p{max-width:720px;margin:22px 0 0;color:var(--sc-ivory-soft);font-size:clamp(15px,2vw,18px);line-height:1.72}.sc-identity-pills{display:flex;flex-wrap:wrap;gap:9px;margin-top:24px}.sc-identity-pills span{padding:7px 11px;border:1px solid var(--sc-line-gold);border-radius:999px;background:rgba(217,182,111,.06);color:#ead9b9;font-size:12px}.sc-input-boundary{max-width:700px;margin:13px 0 0;color:var(--sc-stone);font-size:12px;line-height:1.6}.sc-input-boundary strong{color:var(--sc-ivory-soft)}
.sc-relationship-orbit{position:relative;width:min(300px,70vw);aspect-ratio:1;margin:auto;display:grid;place-items:center}.sc-orbit-ring{position:absolute;inset:8%;border:1px solid var(--sc-line-gold);border-radius:50%}.sc-orbit-ring-two{inset:24%;border-color:rgba(154,116,220,.3);transform:rotate(24deg)}.sc-orbit-core{width:84px;height:84px;border-radius:50%;display:grid;place-items:center;color:var(--sc-gold-bright);border:1px solid rgba(217,182,111,.5);background:radial-gradient(circle,rgba(217,182,111,.15),rgba(79,48,120,.16));box-shadow:0 0 70px rgba(132,88,220,.18)}.sc-orbit-node{position:absolute;width:10px;height:10px;border-radius:50%;background:var(--sc-gold);box-shadow:0 0 16px rgba(217,182,111,.8)}.sc-node-one{top:11%;left:49%}.sc-node-two{right:13%;bottom:28%;background:var(--sc-violet)}.sc-node-three{left:15%;bottom:25%;background:var(--sc-teal)}
.sc-relationship-principle,.sc-honesty-note{display:grid;grid-template-columns:auto 1fr;gap:16px;border:1px solid var(--sc-line-gold);border-radius:22px;background:linear-gradient(145deg,rgba(24,18,38,.86),rgba(12,9,20,.88));box-shadow:var(--sc-shadow-soft)}.sc-relationship-principle{padding:25px;margin-bottom:18px}.sc-principle-icon,.sc-action-icon{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;color:var(--sc-gold-bright);background:rgba(217,182,111,.08);border:1px solid var(--sc-line-gold)}.sc-relationship-principle h2{margin:0 0 8px;font-size:clamp(20px,3vw,29px)}.sc-relationship-principle p:last-child{margin:0;color:var(--sc-stone);line-height:1.68}
.sc-dimension-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.sc-dimension-card{padding:1px;border-radius:19px;background:linear-gradient(140deg,rgba(217,182,111,.4),rgba(154,116,220,.16),rgba(255,255,255,.02))}.sc-dimension-card-inner{position:relative;height:100%;min-height:185px;padding:22px;border-radius:18px;background:linear-gradient(160deg,rgba(28,21,39,.93),rgba(11,8,16,.97))}.sc-dimension-card svg{color:var(--sc-gold-bright);margin-bottom:26px}.sc-dimension-number{position:absolute;top:18px;right:18px;color:rgba(247,240,228,.18);font-family:var(--font-serif);font-size:13px}.sc-dimension-card h3{margin:0 0 8px;font-family:var(--font-serif);font-size:20px}.sc-dimension-card p{margin:0;color:var(--sc-stone);font-size:14px;line-height:1.6}
.sc-relationship-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:18px}.sc-action-card{padding:1px;border-radius:22px;background:linear-gradient(140deg,rgba(217,182,111,.55),rgba(154,116,220,.3),rgba(255,255,255,.04));color:inherit;text-decoration:none;box-shadow:var(--sc-shadow-soft)}.sc-action-card-inner{height:100%;padding:26px;border-radius:21px;background:radial-gradient(circle at 90% 10%,rgba(101,71,171,.18),transparent 38%),linear-gradient(145deg,rgba(27,20,41,.96),rgba(11,8,16,.98))}.sc-action-card h2{margin:0 0 9px;font-family:var(--font-serif);font-size:23px}.sc-action-card p:not(.sc-kicker){min-height:68px;margin:0 0 17px;color:var(--sc-stone);line-height:1.62}.sc-action-card strong{display:inline-flex;align-items:center;gap:7px;color:var(--sc-gold-bright)}.sc-action-icon{margin-bottom:16px}.sc-action-icon-violet{color:#c6b5f3;border-color:rgba(154,116,220,.3);background:rgba(154,116,220,.08)}.sc-honesty-note{margin-top:18px;padding:18px 20px;color:var(--sc-stone);font-size:13px;line-height:1.62}.sc-honesty-note svg{color:var(--sc-teal);margin-top:2px}.sc-honesty-note p{margin:0}.sc-honesty-note strong{color:var(--sc-ivory-soft)}.sc-relationship-footer-link{text-align:center;margin-top:22px}.sc-relationship-footer-link a{display:inline-flex;align-items:center;gap:6px;color:var(--sc-stone);font-size:13px}.sc-relationship-empty{max-width:760px;padding-top:145px}.sc-relationship-empty-card{text-align:center;padding:42px 28px;border:1px solid var(--sc-line-gold);border-radius:24px;background:linear-gradient(145deg,rgba(24,18,38,.92),rgba(12,9,20,.94))}.sc-orbit-mark{width:62px;height:62px;display:grid;place-items:center;margin:0 auto 20px;border-radius:50%;color:var(--sc-gold);border:1px solid var(--sc-line-gold);background:rgba(217,182,111,.08)}.sc-primary-link{display:inline-flex;align-items:center;gap:7px;margin-top:24px;padding:12px 18px;border-radius:12px;background:var(--sc-gold);color:#140e09;text-decoration:none;font-weight:800}@media(max-width:900px){.sc-relationship-hero{grid-template-columns:1fr;gap:18px}.sc-relationship-orbit{width:min(240px,62vw)}.sc-relationship-actions{grid-template-columns:1fr}}@media(max-width:560px){.sc-relationship-main{width:min(100% - 22px,1120px);padding-top:96px}.sc-dimension-grid{grid-template-columns:1fr}.sc-relationship-principle{grid-template-columns:1fr}.sc-action-card p:not(.sc-kicker){min-height:0}}
`;
