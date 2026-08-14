import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { IconInfo, IconLock } from "../components/Icons";

const topics = [
  ["Account & Apple sign-in", "Problems signing in, attaching your profile, or restoring account access."],
  ["Profile calculations", "Birth-data, chart, numerology, Human Design, confidence, or evidence questions."],
  ["Premium access", "Entitlement restoration, checkout, or a purchase that is not appearing correctly."],
  ["Privacy & deletion", "Local clearing, server-data requests, or permanent account deletion."],
] as const;

export default function SupportPage() {
  return (
    <div className="support-page">
      <Navigation />
      <main className="support-shell">
        <header className="support-hero">
          <div className="support-mark"><IconInfo size={26} /></div>
          <div>
            <p className="support-kicker">Help without mystery</p>
            <h1>Tell us what broke, not your secrets.</h1>
            <p>For account access, calculations, premium restoration, privacy requests, or technical problems, use the route that matches what you need.</p>
          </div>
        </header>

        <section className="support-topics" aria-label="Support topics">
          {topics.map(([title, text]) => <article key={title}><strong>{title}</strong><span>{text}</span></article>)}
        </section>

        <section className="support-grid">
          <article className="support-primary">
            <p className="support-label">Direct support</p>
            <h2>Email Soul Codex Support</h2>
            <p>Include your browser or device type, the page you were using, what you expected to happen, and what actually happened. Screenshots are useful when they do not expose private credentials.</p>
            <div className="support-warning"><IconLock size={17}/><span>Do not send passwords, profile-access tokens, payment details, private keys, or Apple credentials.</span></div>
            <a className="support-email" href="mailto:support@soulcodex.app?subject=Soul%20Codex%20support">support@soulcodex.app</a>
          </article>

          <aside className="support-links">
            <p className="support-label">Self-service</p>
            <Link href="/settings"><strong>Settings & account</strong><span>Sign-in state and local data controls</span></Link>
            <Link href="/privacy"><strong>Privacy policy</strong><span>What is stored and where</span></Link>
            <Link href="/delete-account" className="danger"><strong>Delete Account & Data</strong><span>Permanent server deletion flow</span></Link>
            <Link href="/terms"><strong>Terms of Service</strong><span>Service rules and boundaries</span></Link>
          </aside>
        </section>
      </main>
      <style>{`
        .support-page{min-height:100vh;background:radial-gradient(circle at 72% 0%,rgba(74,43,123,.22),transparent 30%),radial-gradient(circle at 15% 25%,rgba(33,110,119,.1),transparent 24%),#09070f;color:#f7f0e4}.support-shell{max-width:980px;margin:0 auto;padding:112px 18px 80px}.support-hero{display:grid;grid-template-columns:auto 1fr;gap:22px;align-items:start;padding:28px;border-radius:26px;border:1px solid rgba(212,168,95,.22);background:linear-gradient(145deg,rgba(25,19,39,.96),rgba(12,9,20,.95));box-shadow:0 28px 80px rgba(0,0,0,.32)}.support-mark{width:66px;height:66px;border-radius:50%;display:grid;place-items:center;color:#d4a85f;border:1px solid rgba(212,168,95,.42);box-shadow:0 0 0 8px rgba(212,168,95,.05)}.support-kicker,.support-label{margin:0 0 8px;color:#d4a85f;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}.support-hero h1{font-family:var(--font-serif);font-size:clamp(2.1rem,6vw,4rem);line-height:1.02;margin:0 0 12px}.support-hero p:last-child{max-width:700px;margin:0;color:rgba(247,240,228,.64);line-height:1.7}.support-topics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.support-topics article,.support-primary,.support-links{border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.028);border-radius:18px}.support-topics article{padding:16px}.support-topics strong{display:block;margin-bottom:6px;font-size:14px}.support-topics span{display:block;color:rgba(247,240,228,.55);font-size:12.5px;line-height:1.5}.support-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(260px,.6fr);gap:14px}.support-primary,.support-links{padding:22px}.support-primary h2{font-family:var(--font-serif);font-size:clamp(1.6rem,4vw,2.3rem);margin:0 0 10px}.support-primary>p:not(.support-label){color:rgba(247,240,228,.64);line-height:1.7}.support-warning{display:flex;gap:9px;align-items:flex-start;margin:18px 0;padding:13px;border-radius:12px;border:1px solid rgba(212,168,95,.16);background:rgba(212,168,95,.05);color:#d8c7a5;font-size:13px;line-height:1.5}.support-warning svg{flex:none;margin-top:1px}.support-email{display:flex;justify-content:center;padding:14px;border-radius:12px;background:#d4a85f;color:#140e09;text-decoration:none;font-weight:800}.support-links{display:flex;flex-direction:column}.support-links a{display:flex;flex-direction:column;gap:4px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.08);color:#f7f0e4;text-decoration:none}.support-links a:last-child{border-bottom:0}.support-links a span{color:rgba(247,240,228,.48);font-size:12px}.support-links .danger strong{color:#ff9698}@media(max-width:780px){.support-topics{grid-template-columns:repeat(2,1fr)}.support-grid{grid-template-columns:1fr}}@media(max-width:560px){.support-shell{padding:96px 12px 70px}.support-hero{grid-template-columns:1fr;padding:20px;border-radius:20px}.support-topics{grid-template-columns:1fr}.support-primary,.support-links{padding:18px;border-radius:15px}}
      `}</style>
    </div>
  );
}
