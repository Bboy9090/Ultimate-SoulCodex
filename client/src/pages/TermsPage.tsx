import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        maxWidth: 720,
        margin: "2rem auto",
        padding: "2rem 1.5rem",
        background: "rgba(28, 22, 53, 0.72)",
        borderRadius: 16,
        color: "#EAEAF5",
        lineHeight: 1.7,
        fontSize: "0.95rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", marginBottom: "0.5rem" }}>Terms of Service</h1>
        <p style={{ color: "var(--sc-gold)", fontSize: "0.85rem", opacity: 0.7 }}>

          Effective: April 21, 2026
        </p>
      </div>

      <Section title="1. Acceptance of Terms">
        <p>
          By accessing or using Soul Codex ("the App"), you agree to be bound by these Terms of Service. 
          If you do not agree, please do not use the App.
        </p>
      </Section>

      <Section title="2. The Nature of the Soul Codex">
        <p>
          Soul Codex provides metaphysical, astronomical, and psychological interpretations for personal 
          growth and self-reflection. 
        </p>
        <p style={{ fontWeight: 600, color: "var(--sc-gold)" }}>

          CRITICAL DISCLAIMER: The App does not provide medical, legal, financial, or professional advice. 
          All guidance, including AI-generated responses from the "Soul Oracle," is for entertainment and 
          spiritual inquiry only.
        </p>
      </Section>

      <Section title="3. AI Integration (Soul Oracle)">
        <p>
          Our platform utilizes advanced Large Language Models (including Google Gemini) to synthesize 
          complex esoteric data into narrative guidance. You acknowledge that AI can generate 
          inaccurate or metaphysical content. Soul Codex is not responsible for any actions taken 
          based on AI-generated guidance.
        </p>
      </Section>

      <Section title="4. User Identity & Data">
        <p>
          You are responsible for the security of your account (including Apple Identity or local 
          credentials). You agree to provide accurate birth details for calculations. We reserve 
          the right to terminate accounts that violate our community standards.
        </p>
      </Section>

      <Section title="5. Subscriptions & Payments">
        <p>
          Premium features are processed exclusively via Apple In-App Purchases. 
          Subscriptions automatically renew unless cancelled at least 24 hours before the end of the 
          current period. Refunds are handled according to Apple's App Store policies.
        </p>
      </Section>

      <Section title="6. Intellectual Property">
        <p>
          The underlying Engine of the Eternal Now, the Soul Codex branding, and the visual 
          synthesis of esoteric symbols are the exclusive property of Soul Codex. You are granted 
          a personal, non-transferable license to use the App.
        </p>
      </Section>

      <Section title="7. Data Deletion">
        <p>
          As part of our commitment to data sovereignty and App Store compliance, you have the 
          absolute right to be forgotten. You may delete your account and all associated profile 
          data at any time through the Profile Settings. This action is irreversible and purges 
          all records from our persistent storage.
        </p>
      </Section>

      <Section title="8. Contact">
        <p>
          For questions regarding these terms, contact us at <strong>legal@soulcodex.app</strong>.
        </p>
      </Section>

      <div style={{ marginTop: "3rem", textAlign: "center", opacity: 0.5, fontSize: "0.8rem" }}>
        ◈ © 2026 Soul Codex ◈
      </div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2
        style={{
          fontSize: "1.2rem",
          marginTop: "1.5rem",
          borderBottom: "1px solid rgba(217,207,184,0.5)",
          paddingBottom: "0.3rem",
          color: "var(--sc-gold)",
          fontFamily: "var(--font-serif)",
        }}
      >
        {title}
      </h2>
      <div style={{ marginTop: "0.75rem" }}>{children}</div>
    </div>
  );
}
