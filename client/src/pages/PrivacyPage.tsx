import Navigation from "@/components/navigation";

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "7rem 1.5rem 3rem",
        }}
      >
        <div
          style={{
            padding: "2rem 1.5rem",
            background: "rgba(28, 22, 53, 0.72)",
            borderRadius: 16,
            color: "#EAEAF5",
            lineHeight: 1.7,
            fontSize: "0.95rem",
          }}
        >
          <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>
            Privacy Policy
          </h1>
          <p
            style={{
              color: "var(--sc-gold)",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
              opacity: 0.7,
            }}
          >
            Last updated: August 4, 2026
          </p>

          <p>
            Soul Codex ("we", "our", "the app") is committed to protecting
            your privacy. This policy explains what data we collect, how we use
            it, and your rights.
          </p>

          <Section title="1. Information We Collect">
            <p>
              <strong>Information you provide:</strong>
            </p>
            <ul>
              <li>
                <strong>Birth details:</strong> Name, date of birth, time of
                birth, and birth location, used to generate your profile.
              </li>
              <li>
                <strong>Behavioral responses:</strong> Answers you choose to
                provide about patterns, decisions, and preferences.
              </li>
              <li>
                <strong>Account information:</strong> Email address and
                password when you create an optional account.
              </li>
            </ul>
            <p>
              <strong>Information collected automatically:</strong>
            </p>
            <ul>
              <li>
                <strong>Session data:</strong> Session identifiers needed to
                maintain authenticated or server-backed experiences.
              </li>
              <li>
                <strong>Technical information:</strong> Browser or app
                platform, operating system, screen size, request logs, and
                error details needed to operate, secure, and troubleshoot Soul
                Codex.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul>
              <li>Generate and store the profile features you request.</li>
              <li>Provide compatibility analysis between profiles.</li>
              <li>Generate requested AI-assisted guidance where available.</li>
              <li>Send notifications only when you opt in.</li>
              <li>Verify premium entitlements.</li>
              <li>Operate, secure, troubleshoot, and improve Soul Codex.</li>
            </ul>
          </Section>

          <Section title="3. Data Storage & Security">
            <p>
              Local-first profile data is stored on your device for offline
              access. Information sent to server-backed features may also be
              stored in the configured production database. Passwords for
              optional local accounts are stored as secure hashes rather than
              readable passwords. HTTPS protects supported production traffic
              in transit.
            </p>
            <p>
              Payment details are entered on Stripe's hosted checkout page.
              Soul Codex does not collect, transmit, log, or store card numbers,
              security codes, or expiration dates.
            </p>
          </Section>

          <Section title="4. Third-Party Services">
            <ul>
              <li>
                <strong>AI providers:</strong> A configured AI provider may
                process the profile context and question needed to generate a
                requested response.
              </li>
              <li>
                <strong>Stripe:</strong> Hosts secure checkout and processes
                payment information when premium checkout is enabled.
              </li>
              <li>
                <strong>Infrastructure providers:</strong> Host the app,
                database, and encrypted network traffic needed to provide the
                service.
              </li>
            </ul>
          </Section>

          <Section title="5. Data Sharing">
            <p>
              We do not sell or rent your personal information for marketing.
              Data is shared only with service providers as needed to operate
              requested features, secure the service, or process payment.
            </p>
          </Section>

          <Section title="6. Your Choices and Rights">
            <ul>
              <li>
                <strong>Access:</strong> You can inspect the profile data shown
                in the app.
              </li>
              <li>
                <strong>Local deletion:</strong> Settings can clear the saved
                profile and local application data from the current device.
              </li>
              <li>
                <strong>Server deletion:</strong> Account holders may request
                deletion through Settings or contact support when account
                access is unavailable.
              </li>
              <li>
                <strong>Opt-out:</strong> You can disable notifications through
                your browser or device settings.
              </li>
            </ul>
          </Section>

          <Section title="7. Children's Privacy">
            <p>
              Soul Codex is intended for people age 13 and older and is not
              directed at children under 13. We do not knowingly collect
              personal information from children under 13. If we learn that we
              have done so, we will delete it.
            </p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>
              We may update this policy as the product changes. Significant
              changes will be presented through the app or another appropriate
              notice.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              For privacy questions or data requests, contact{" "}
              <strong>privacy@soulcodex.app</strong>.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
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
    </section>
  );
}
