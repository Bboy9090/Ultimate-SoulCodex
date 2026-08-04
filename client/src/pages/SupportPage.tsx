import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { IconInfo, IconLock } from "../components/Icons";

export default function SupportPage() {
  return (
    <div className="nebula-bg" style={{ minHeight: "100vh" }}>
      <Navigation />
      <main
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "7rem 1.5rem 6rem",
        }}
      >
        <section
          className="glassmorphism"
          style={{ padding: "clamp(1.25rem, 5vw, 2rem)", borderRadius: 24 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "var(--sc-gold)",
            }}
          >
            <IconInfo size={24} />
            <h1
              className="heading-display"
              style={{ fontSize: "1.9rem", margin: 0 }}
            >
              Soul Codex Support
            </h1>
          </div>
          <p style={{ color: "var(--sc-stone)", lineHeight: 1.7 }}>
            For account access, profile calculations, premium-entitlement
            restoration, privacy requests, or technical problems, email{" "}
            <a
              href="mailto:support@soulcodex.app"
              style={{ color: "var(--sc-gold)", overflowWrap: "anywhere" }}
            >
              support@soulcodex.app
            </a>
            .
          </p>
          <p style={{ color: "var(--sc-stone)", lineHeight: 1.7 }}>
            Include your browser or device type, the page you were using, and a
            short description of what happened. Do not send passwords,
            profile-access tokens, payment details, or private keys.
          </p>

          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              marginTop: "1.5rem",
            }}
          >
            <a
              href="mailto:support@soulcodex.app?subject=Soul%20Codex%20support"
              className="btn btn-primary"
              style={{ textAlign: "center" }}
            >
              Email Support
            </a>
            <Link
              href="/privacy"
              className="btn btn-ghost"
              style={{ textAlign: "center" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="btn btn-ghost"
              style={{ textAlign: "center" }}
            >
              Terms of Service
            </Link>
            <Link
              href="/settings"
              className="btn btn-ghost"
              style={{ textAlign: "center", color: "var(--sc-danger)" }}
            >
              <IconLock
                size={14}
                style={{ display: "inline", marginRight: "0.4rem" }}
              />
              Local Data Controls
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
