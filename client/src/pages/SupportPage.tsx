import { Link } from "wouter";
import { IconArrowLeft, IconInfo, IconLock } from "../components/Icons";

export default function SupportPage() {
  return (
    <div className="nebula-bg" style={{ minHeight: "100vh", padding: "var(--safe-top) 1.5rem var(--safe-bottom)" }}>
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 0 6rem" }}>
        <Link href="/" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
          <IconArrowLeft size={16} /> Back to Soul Codex
        </Link>

        <section className="glassmorphism" style={{ padding: "2rem", borderRadius: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--sc-gold)" }}>
            <IconInfo size={24} />
            <h1 className="heading-display" style={{ fontSize: "1.9rem", margin: 0 }}>Soul Codex Support</h1>
          </div>
          <p style={{ color: "var(--sc-stone)", lineHeight: 1.7 }}>
            For account access, profile calculations, premium-entitlement restoration, or technical problems,
            email <a href="mailto:support@soulcodex.app" style={{ color: "var(--sc-gold)" }}>support@soulcodex.app</a>.
          </p>
          <p style={{ color: "var(--sc-stone)", lineHeight: 1.7 }}>
            Include your device type, app version, and a short description of what happened. Do not send passwords or access codes.
          </p>

          <div style={{ display: "grid", gap: "0.75rem", marginTop: "1.5rem" }}>
            <a href="mailto:support@soulcodex.app?subject=Soul%20Codex%20support" className="btn btn-primary" style={{ textAlign: "center" }}>Email Support</a>
            <Link href="/privacy" className="btn btn-ghost" style={{ textAlign: "center" }}>Privacy Policy</Link>
            <Link href="/terms" className="btn btn-ghost" style={{ textAlign: "center" }}>Terms of Service</Link>
            <Link href="/account-deletion" className="btn btn-ghost" style={{ textAlign: "center", color: "var(--sc-danger)" }}>
              <IconLock size={14} style={{ display: "inline", marginRight: "0.4rem" }} /> Delete Account & Data
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
