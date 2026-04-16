export default function PrivacyPage() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "2rem auto",
        padding: "2rem 1.5rem",
        background: "rgba(242,234,218,0.96)",
        borderRadius: 16,
        color: "#1A0E07",
        lineHeight: 1.7,
        fontSize: "0.95rem",
      }}
    >
      <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>Privacy Policy</h1>
      <p style={{ color: "#6b5a3a", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        Last updated: April 13, 2026
      </p>

      <p>
        Soul Codex ("we", "our", "the app") is committed to protecting your privacy. This policy
        explains what data we collect, how we use it, and your rights.
      </p>

      <Section title="1. Information We Collect">
        <p><strong>Information you provide:</strong></p>
        <ul>
          <li><strong>Birth details:</strong> Name, date of birth, time of birth, and birth location — used to generate your soul profile.</li>
          <li><strong>Behavioral responses:</strong> Answers to onboarding questions about stress patterns, decision style, and energy preferences.</li>
          <li><strong>Account information:</strong> Email address and password if you create an account (optional).</li>
        </ul>
        <p><strong>Information collected automatically:</strong></p>
        <ul>
          <li><strong>Session data:</strong> Anonymous session identifiers to maintain your experience across visits.</li>
          <li><strong>Usage analytics:</strong> Page views and interaction patterns via Microsoft Clarity (anonymized).</li>
          <li><strong>Device information:</strong> Browser type, operating system, and screen size for optimizing the experience.</li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul>
          <li>Generate and store your personalized soul profile and daily guidance.</li>
          <li>Provide compatibility analysis between profiles.</li>
          <li>Power the AI Soul Guide chat feature.</li>
          <li>Send push notifications (only if you opt in).</li>
          <li>Process payments for premium features via Stripe.</li>
          <li>Improve the app experience through anonymized analytics.</li>
        </ul>
      </Section>

      <Section title="3. Data Storage & Security">
        <p>
          Your profile data is stored securely in a PostgreSQL database hosted on Neon (cloud
          infrastructure). Passwords are hashed using argon2id with secure parameters. We use HTTPS
          for all data transmission.
        </p>
        <p>Your soul profile is also cached locally on your device (localStorage) for offline access.</p>
      </Section>

      <Section title="4. Third-Party Services">
        <ul>
          <li><strong>Google Gemini AI:</strong> Processes your profile data to generate personalized text content. Google's AI privacy policy applies.</li>
          <li><strong>Stripe:</strong> Handles payment processing. We do not store your credit card information. Stripe's privacy policy applies.</li>
          <li><strong>Microsoft Clarity:</strong> Collects anonymized usage analytics. No personally identifiable information is shared.</li>
        </ul>
      </Section>

      <Section title="5. Data Sharing">
        <p>
          We do not sell, rent, or share your personal information with third parties for marketing
          purposes. Data is only shared with the service providers listed above as necessary to
          operate the app.
        </p>
      </Section>

      <Section title="6. Your Rights">
        <ul>
          <li><strong>Access:</strong> You can view all data associated with your profile within the app.</li>
          <li><strong>Deletion:</strong> You can request deletion of your account and all associated data by contacting us.</li>
          <li><strong>Portability:</strong> You can export your profile data from the app.</li>
          <li><strong>Opt-out:</strong> You can disable push notifications at any time through your device settings.</li>
        </ul>
      </Section>

      <Section title="7. Children's Privacy">
        <p>
          Soul Codex is not directed at children under 13. We do not knowingly collect information
          from children under 13. If we learn we have collected such information, we will delete it
          promptly.
        </p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>
          We may update this policy from time to time. We will notify you of significant changes
          through the app or via email if you have an account.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          For privacy questions or data requests, contact us at{" "}
          <strong>privacy@soulcodex.app</strong>.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <>
      <h2
        style={{
          fontSize: "1.15rem",
          marginTop: "2rem",
          borderBottom: "1px solid #d9cfb8",
          paddingBottom: "0.3rem",
        }}
      >
        {title}
      </h2>
      {children}
    </>
  );
}
