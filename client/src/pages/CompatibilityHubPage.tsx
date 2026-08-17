import { Link } from "wouter";
import Navigation from "../components/navigation";
import { loadActiveProfile } from "../lib/ActiveProfileRepository";
import {
  ArrowRight,
  Brain,
  Flame,
  Heart,
  Lightbulb,
  Orbit,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

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
  { icon: Heart, title: "Romantic", text: "Attachment, affection, emotional safety, and long-range relationship rhythm." },
  { icon: Flame, title: "Chemistry", text: "Attraction, intensity, play, desire, and the conditions that help closeness feel safe." },
  { icon: Brain, title: "Mental", text: "Conversation, humor, curiosity, decision-making, and how two minds actually meet." },
  { icon: Users, title: "Friendship", text: "Ease, loyalty, daily-life compatibility, and whether the bond still works without romance." },
  { icon: Lightbulb, title: "Growth", text: "Where the connection stretches both people, exposes patterns, and asks for maturity." },
  { icon: ShieldCheck, title: "Repair", text: "Likely conflict loops, nervous-system needs, boundaries, and how trust is rebuilt after friction." },
];

export default function CompatibilityHubPage() {
  const result = loadActiveProfile();
  const profile = result.profile;

  if (!profile) {
    return (
      <div className="sc-page-shell">
        <Navigation />
        <main className="sc-relationship-main sc-relationship-empty">
          <section className="sc-relationship-empty-card">
            <div className="sc-orbit-mark" aria-hidden="true"><Heart size={28} /></div>
            <p className="sc-kicker">Relationship Intelligence</p>
            <h1>Compatibility starts with one saved identity.</h1>
            <p>
              Build your Soul Profile once. Compatibility, Timeline, and every later intelligence layer reuse that foundation instead of making you re-enter yourself on every screen.
            </p>
            <Link href="/create" className="sc-primary-link">Create your Soul Profile <ArrowRight size={16} /></Link>
          </section>
        </main>
        <style>{styles}</style>
      </div>
    );
  }

  const name = fact(profile, ["name", "firstName", "codename"]) || "Your";
  const lifePath = fact(profile, ["lifePathNumber", "numerologyData.lifePathNumber", "numerologyData.lifePath"]);
  const sunSign = fact(profile, ["astrologyData.sun.sign", "astrology.sun.sign"]);
  const moonSign = fact(profile, ["astrologyData.moon.sign", "astrology.moon.sign"]);
  const risingSign = fact(profile, ["astrologyData.rising.sign", "astrologyData.ascendant.sign", "astrology.rising.sign"]);
  const profileId = fact(profile, ["id", "uuid"]);

  const identityFacts = [
    sunSign ? `${sunSign} Sun` : null,
    moonSign ? `${moonSign} Moon` : null,
    risingSign ? `${risingSign} Rising` : null,
    lifePath ? `Life Path ${lifePath}` : null,
  ].filter(Boolean);

  return (
    <div className="sc-page-shell">
      <Navigation />
      <main className="sc-relationship-main">
        <header className="sc-relationship-hero">
          <div className="sc-relationship-copy">
            <p className="sc-kicker">Relationship Intelligence</p>
            <h1>{name} relationship blueprint</h1>
            <p className="sc-relationship-lede">
              Compatibility is not a magic percentage. Soul Codex separates attraction, communication, trust, friction, repair, and growth so one loud signal cannot impersonate the whole relationship.
            </p>
            <div className="sc-identity-pills" aria-label="Saved identity signals">
              {identityFacts.length ? identityFacts.map((item) => <span key={String(item)}>{item}</span>) : <span>Saved identity available</span>}
            </div>
          </div>

          <div className="sc-relationship-orbit" aria-hidden="true">
            <div className="sc-orbit-ring sc-orbit-ring-one" />
            <div className="sc-orbit-ring sc-orbit-ring-two" />
            <div className="sc-orbit-core"><Heart size={30} /></div>
            <span className="sc-orbit-node sc-node-one" />
            <span className="sc-orbit-node sc-node-two" />
            <span className="sc-orbit-node sc-node-three" />
          </div>
        </header>

        <section className="sc-relationship-principle">
          <div className="sc-principle-icon"><Orbit size={20} /></div>
          <div>
            <p className="sc-kicker">Clarity before scoring</p>
            <h2>Easy is not always healthy. Difficult is not always wrong.</h2>
            <p>
              A strong match can contain friction. A weak match can feel intoxicating. The useful question is where the bond flows, where it costs energy, and whether both people can repair what they trigger.
            </p>
          </div>
        </section>

        <section className="sc-dimension-grid" aria-label="Compatibility dimensions">
          {dimensions.map(({ icon: Icon, title, text }, index) => (
            <article className="sc-dimension-card" key={title}>
              <div className="sc-dimension-card-inner">
                <div className="sc-dimension-number">0{index + 1}</div>
                <Icon size={20} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="sc-relationship-actions">
          <Link href="/compatibility/explorer" className="sc-action-card">
            <div className="sc-action-card-inner">
              <div className="sc-action-icon"><Sparkles size={22} /></div>
              <p className="sc-kicker">Explore patterns</p>
              <h2>Universal Match Explorer</h2>
              <p>Map romantic, chemistry, mental, friendship, growth, easiest-flow, and hardest-lesson patterns without reducing them to one score.</p>
              <strong>Open your full match map <ArrowRight size={16} /></strong>
            </div>
          </Link>

          <Link href="/compatibility/compare" className="sc-action-card" data-testid="compatibility-compare-person">
            <div className="sc-action-icon sc-action-icon-violet"><Users size={22} /></div>
            <p className="sc-kicker">Person to person</p>
            <h2>Compare a specific person</h2>
            <p>Your identity stays loaded. Add only the other person's details, then inspect separate romantic, chemistry, mental/friendship, and growth dimensions.</p>
            <strong>Compare one person <ArrowRight size={16} /></strong>
          </Link>
        </section>

        <aside className="sc-honesty-note">
          <ShieldCheck size={18} />
          <p><strong>Evidence boundary:</strong> symbolic systems can organize patterns and reflection, but they do not prove relationship outcomes. Missing or unverified data reduces scope instead of increasing confidence, and Human Design remains excluded from Foundation compatibility.</p>
        </aside>

        {profileId && (
          <div className="sc-relationship-footer-link">
            <Link href={`/profile/${profileId}`}>Review the saved identity powering this page <ArrowRight size={14} /></Link>
          </div>
        )}
      </main>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .sc-page-shell{min-height:100vh;color:var(--foreground,#f7f0e4);background:radial-gradient(circle at 74% 6%,rgba(83,58,152,.2),transparent 27%),radial-gradient(circle at 13% 24%,rgba(25,104,128,.12),transparent 25%),linear-gradient(180deg,#08060e 0%,#0b0813 52%,#07060b 100%)}
  .sc-relationship-main{position:relative;z-index:1;width:min(1120px,calc(100% - 32px));margin:0 auto;padding:118px 0 84px}
  .sc-relationship-hero{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(260px,.6fr);gap:48px;align-items:center;padding:34px 0 38px}
  .sc-relationship-copy,.sc-relationship-principle>div:last-child,.sc-dimension-card,.sc-action-card{min-width:0}
  .sc-kicker{margin:0 0 10px;color:var(--sc-gold,#d4a85f);font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
  .sc-relationship-copy h1,.sc-relationship-empty-card h1{margin:0;font-family:var(--font-serif);font-size:clamp(2.75rem,7vw,5.8rem);font-weight:500;line-height:.98;letter-spacing:-.04em;max-width:820px;overflow-wrap:anywhere}
  .sc-relationship-lede,.sc-relationship-empty-card>p{max-width:720px;margin:22px 0 0;color:rgba(247,240,228,.69);font-size:clamp(15px,2vw,18px);line-height:1.72}
  .sc-identity-pills{display:flex;flex-wrap:wrap;gap:9px;margin-top:25px}.sc-identity-pills span{padding:7px 11px;border:1px solid rgba(212,168,95,.22);border-radius:999px;background:rgba(212,168,95,.06);color:#ead9b9;font-size:12px}
  .sc-relationship-orbit{position:relative;width:min(300px,70vw);aspect-ratio:1;margin:auto;display:grid;place-items:center}.sc-orbit-ring{position:absolute;border:1px solid rgba(212,168,95,.24);border-radius:50%;inset:8%}.sc-orbit-ring-two{inset:24%;border-color:rgba(162,132,255,.3);transform:rotate(24deg)}.sc-orbit-core{width:84px;height:84px;border-radius:50%;display:grid;place-items:center;color:#f2d79e;border:1px solid rgba(212,168,95,.52);background:radial-gradient(circle,rgba(212,168,95,.16),rgba(79,48,120,.16));box-shadow:0 0 70px rgba(132,88,220,.18)}.sc-orbit-node{position:absolute;width:10px;height:10px;border-radius:50%;background:#d4a85f;box-shadow:0 0 16px rgba(212,168,95,.8)}.sc-node-one{top:11%;left:49%}.sc-node-two{right:13%;bottom:28%;background:#9f8cff}.sc-node-three{left:15%;bottom:25%;background:#55c5d6}
  .sc-relationship-principle,.sc-honesty-note{display:grid;grid-template-columns:auto minmax(0,1fr);gap:16px;border:1px solid rgba(212,168,95,.18);border-radius:22px;background:linear-gradient(145deg,rgba(24,18,38,.86),rgba(12,9,20,.84));box-shadow:0 28px 80px rgba(0,0,0,.22)}.sc-relationship-principle{padding:25px;margin:4px 0 18px}.sc-principle-icon,.sc-action-icon{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;color:#d4a85f;background:rgba(212,168,95,.08);border:1px solid rgba(212,168,95,.2)}.sc-relationship-principle h2{margin:0 0 8px;font-size:clamp(20px,3vw,29px);font-weight:600;overflow-wrap:anywhere}.sc-relationship-principle p:last-child{margin:0;color:rgba(247,240,228,.64);line-height:1.68}
  .sc-dimension-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
  .sc-dimension-card{position:relative;min-height:205px;padding:1px;border-radius:19px;background:linear-gradient(140deg,rgba(217,182,111,.4) 0%,rgba(255,255,255,.06) 45%,rgba(255,255,255,.02) 100%);overflow:hidden;min-width:0}
  .sc-dimension-card-inner{position:relative;height:100%;padding:22px;border-radius:18px;background:linear-gradient(160deg,rgba(28,21,39,.92),rgba(11,8,16,.96))}
  .sc-dimension-card-inner::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.05),transparent 34%)}
  .sc-dimension-card svg{color:#e4c47f;margin-bottom:28px;filter:drop-shadow(0 0 8px rgba(217,182,111,.25))}
  .sc-dimension-number{position:absolute;top:18px;right:18px;color:rgba(247,240,228,.18);font-family:var(--font-serif);font-size:13px;letter-spacing:.12em}
  .sc-dimension-card h3{margin:0 0 8px;font-family:var(--font-serif);font-size:19px;font-weight:600}
  .sc-dimension-card p{margin:0;color:rgba(247,240,228,.58);font-size:14px;line-height:1.6}
  .sc-relationship-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:18px}
  .sc-action-card{position:relative;display:block;padding:1px;border-radius:22px;background:linear-gradient(140deg,rgba(217,182,111,.55) 0%,rgba(154,116,220,.3) 50%,rgba(255,255,255,.04) 100%);color:inherit;text-decoration:none;box-shadow:0 24px 70px rgba(0,0,0,.28);min-width:0}
  .sc-action-card-inner{position:relative;padding:26px;border-radius:21px;background:radial-gradient(circle at 90% 10%,rgba(101,71,171,.18),transparent 38%),linear-gradient(145deg,rgba(27,20,41,.96),rgba(11,8,16,.98));overflow:hidden}
  .sc-action-card-inner::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.05),transparent 34%)}
  .sc-action-card h2{position:relative;margin:0 0 9px;font-family:var(--font-serif);font-size:23px;font-weight:600;overflow-wrap:anywhere}
  .sc-action-card>.sc-action-card-inner>p:not(.sc-kicker){position:relative;min-height:68px;margin:0 0 17px;color:rgba(247,240,228,.62);line-height:1.62}
  .sc-action-card strong{position:relative;display:inline-flex;align-items:center;gap:7px;color:#e4c47f;flex-wrap:wrap}
  .sc-action-icon{position:relative;margin-bottom:16px;width:44px;height:44px;border-radius:13px;display:grid;place-items:center;color:#f2d79e;background:linear-gradient(145deg,rgba(217,182,111,.18),rgba(154,116,220,.1));border:1px solid rgba(217,182,111,.28);box-shadow:0 0 24px rgba(217,182,111,.15)}
  .sc-action-icon-violet{color:#ad97ff;border-color:rgba(173,151,255,.23);background:rgba(173,151,255,.08);box-shadow:0 0 24px rgba(173,151,255,.15)}
  .sc-honesty-note{margin-top:18px;padding:18px 20px;color:rgba(247,240,228,.62);font-size:13px;line-height:1.62}.sc-honesty-note svg{color:#67c7c5;margin-top:2px}.sc-honesty-note p{margin:0;min-width:0}.sc-honesty-note strong{color:#d9eee9}.sc-relationship-footer-link{text-align:center;margin-top:22px}.sc-relationship-footer-link a{display:inline-flex;align-items:center;gap:6px;color:rgba(247,240,228,.52);font-size:13px;flex-wrap:wrap;justify-content:center}
  .sc-relationship-empty{max-width:760px;padding-top:145px}.sc-relationship-empty-card{text-align:center;padding:42px 28px;border:1px solid rgba(212,168,95,.2);border-radius:24px;background:linear-gradient(145deg,rgba(24,18,38,.92),rgba(12,9,20,.94))}.sc-orbit-mark{width:62px;height:62px;display:grid;place-items:center;margin:0 auto 20px;border-radius:50%;color:#d4a85f;border:1px solid rgba(212,168,95,.3);background:rgba(212,168,95,.08)}.sc-relationship-empty-card h1{font-size:clamp(2.1rem,6vw,4rem)}.sc-relationship-empty-card>p{margin-left:auto;margin-right:auto}.sc-primary-link{display:inline-flex;align-items:center;gap:7px;margin-top:24px;padding:12px 18px;border-radius:12px;background:#d4a85f;color:#140e09;text-decoration:none;font-weight:800;flex-wrap:wrap;justify-content:center}
  @media(max-width:900px){.sc-relationship-hero{grid-template-columns:1fr;gap:18px}.sc-relationship-orbit{width:min(240px,62vw)}.sc-dimension-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sc-relationship-actions{grid-template-columns:1fr}}
  @media(max-width:560px){.sc-relationship-main{width:min(100% - 22px,1120px);padding-top:96px}.sc-relationship-hero{padding-top:24px}.sc-dimension-grid{grid-template-columns:1fr}.sc-dimension-card{min-height:0}.sc-relationship-principle{grid-template-columns:1fr}.sc-relationship-orbit{width:205px}.sc-action-card-inner>p:not(.sc-kicker){min-height:0}}
  @media(prefers-reduced-motion:reduce){.sc-orbit-ring,.sc-orbit-node{animation:none!important}}
`;
