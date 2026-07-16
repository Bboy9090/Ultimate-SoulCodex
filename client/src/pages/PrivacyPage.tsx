export default function PrivacyPage() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "2rem auto",
        padding: "2rem 1.5rem",
        background: "rgba(28, 22, 53, 0.72)",
        borderRadius: 16,
        color: "#EAEAF5",
        lineHeight: 1.7,
        fontSize: "0.95rem",
      }}
    >
      <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>Privacy Policy</h1>
      <p style={{ color: "var(--sc-gold)", fontSize: "0.85rem", marginBottom: "1.5rem", opacity: 0.7 }}>

        Last updated: July 16, 2026
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
          <li><strong>Technical information:</strong> Browser or app platform, operating system, screen size, request logs, and error details needed to operate, secure, and troubleshoot Soul Codex.</li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul>
          <li>Generate and store your personalized soul profile and daily guidance.</li>
          <li>Provide compatibility analysis between profiles.</li>
          <li>Power the AI Soul Guide chat feature.</li>
          <li>Send push notifications (only if you opt in).</li>
          <li>Verify premium entitlements associated with your account or session.</li>
          <li>Operate, secure, troubleshoot, and improve Soul Codex.</li>
        </ul>
      </Section>

      <Section title="3. Data Storage & Security">
        <p>
          Profile data sent to our service is stored in our production PostgreSQL database.
          Passwords are hashed using argon2id with secure parameters. We use HTTPS for data in transit.
        </p>
        <p>Your soul profile is also cached locally on your device (localStorage) for offline access.</p>
      </Section>

      <Section title="4. Third-Party Services">
        <ul>
          <li><strong>AI providers:</strong> Google Gemini, OpenAI, or Groq may process the profile context and questions needed to generate a requested reading or Soul Guide response, depending on service availability.</li>
          <li><strong>Apple:</strong> Processes Apple identity information when you choose Sign in with Apple.</li>
          <li><strong>Infrastructure providers:</strong> Host the app, database, and encrypted network traffic needed to provide the service.</li>
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
          <li><strong>Deletion:</strong> Open Settings → Delete Account & Data to permanently delete your account or anonymous session data. You may also use the public account-deletion page.</li>
          <li><strong>Opt-out:</strong> You can disable push notifications at any time through your device settings.</li>
        </ul>
      </Section>

      <Section title="7. Children's Privacy">
        <p>
          Soul Codex is intended for people age 13 and older and is not directed at children under 13.
          We do not knowingly collect information from children under 13. If we learn we have collected such information, we will delete it
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

      <p style={{ marginTop: "2rem" }}>
        <a href="/account-deletion" style={{ color: "var(--sc-gold)" }}>Delete your Soul Codex account and data</a>
      </p>
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
          borderBottom: "1px solid var(--sc-gold-soft)",
          paddingBottom: "0.3rem",
          color: "var(--sc-gold)",
        }}
      >
        {title}
      </h2>
      {children}
    </>
  );
}
