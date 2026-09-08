import React from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/navigation";
import { IconDiamond } from "../components/Icons";

export default function TermsPage() {
  return (
    <div className="sc-app-shell">
      <Navigation />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "7rem 1.5rem 4rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sc-panel sc-panel-gold"
          style={{
            padding: "clamp(1.75rem,5vw,2.6rem)",
            color: "var(--sc-ivory-soft)",
            lineHeight: 1.7,
            fontSize: "0.95rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p className="sc-eyebrow" style={{ justifyContent: "center" }}>Legal</p>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 500,
                fontSize: "clamp(1.9rem,5vw,2.6rem)",
                color: "var(--sc-ivory)",
                margin: "0.5rem 0",
              }}
            >
              Terms of Service
            </h1>
            <p
              style={{
                color: "var(--sc-gold-bright)",
                fontSize: "0.85rem",
                opacity: 0.85,
              }}
            >
              Effective: August 4, 2026
            </p>
          </div>

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using Soul Codex, you agree to these Terms of
              Service. If you do not agree, do not use the service.
            </p>
          </Section>

          <Section title="2. Nature of Soul Codex">
            <p>
              Soul Codex combines astronomical calculations, numerology,
              symbolic systems, and reflective interpretation for personal
              insight. Verified, unverified, and unresolved outputs are labeled
              separately where the product supports those distinctions.
            </p>
            <p style={{ fontWeight: 600, color: "var(--sc-gold)" }}>
              Soul Codex does not provide medical, legal, financial, mental
              health, or other professional advice. Do not use its readings as
              a substitute for qualified professional care or as the sole basis
              for a high-stakes decision.
            </p>
          </Section>

          <Section title="3. Calculations, Interpretations, and AI">
            <p>
              Calculated facts are kept separate from narrative interpretation.
              Some requested explanations may use a configured AI provider. AI
              output can be incomplete or inaccurate, so inspect the available
              evidence, uncertainty, and limitations before relying on it.
            </p>
          </Section>

          <Section title="4. Your Information and Access">
            <p>
              You are responsible for providing accurate birth details and for
              protecting any account credentials or profile-access capability
              associated with your use. Local-first profiles may remain on the
              device where they were created unless you deliberately use a
              server-backed feature.
            </p>
          </Section>

          <Section title="5. Premium Access and Payments">
            <p>
              Premium availability, included tools, and price are shown before
              purchase. When web checkout is enabled, payment details are
              entered on Stripe's hosted checkout page. Soul Codex does not
              collect or store card numbers, security codes, or expiration
              dates. Premium entitlement is activated only after confirmed
              payment and requires persistent profile storage.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              Soul Codex branding, original software, original presentation,
              and original written material are protected by applicable
              intellectual-property law. You receive a personal,
              non-transferable right to use the service, not ownership of the
              underlying software or brand.
            </p>
          </Section>

          <Section title="7. Deletion and Data Control">
            <p>
              You may clear local profile data through Settings. Account holders
              may request deletion of server-backed account data through the
              available account controls or by contacting support when account
              access is unavailable. Deletion may be irreversible.
            </p>
          </Section>

          <Section title="8. Availability and Changes">
            <p>
              Features may be corrected, limited, paused, or removed when their
              calculation, verification, security, or infrastructure does not
              meet the current release standard. We may update these terms when
              the product or its operating requirements change.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              For questions regarding these terms, contact{" "}
              <strong>legal@soulcodex.app</strong>.
            </p>
          </Section>

          <div
            style={{
              marginTop: "3rem",
              textAlign: "center",
              opacity: 0.5,
              fontSize: "0.8rem",
            }}
          >
            <IconDiamond size={12} style={{ verticalAlign: "middle" }} /> © 2026
            Soul Codex{" "}
            <IconDiamond size={12} style={{ verticalAlign: "middle" }} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2
        style={{
          fontSize: "1.2rem",
          marginTop: "1.5rem",
          borderBottom: "1px solid var(--sc-line-gold)",
          paddingBottom: "0.4rem",
          color: "var(--sc-gold-bright)",
          fontFamily: "var(--font-serif)",
          fontWeight: 500,
        }}
      >
        {title}
      </h2>
      <div style={{ marginTop: "0.75rem" }}>{children}</div>
    </section>
  );
}
