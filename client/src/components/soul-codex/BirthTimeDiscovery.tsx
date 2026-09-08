/**
 * BirthTimeDiscovery Component
 *
 * Optional flow shown when birth time is unknown.
 * Explains why exact time matters and provides collection methods.
 */

interface BirthTimeDiscoveryProps {
  onDismiss?: () => void;
}

export default function BirthTimeDiscovery({
  onDismiss,
}: BirthTimeDiscoveryProps) {
  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "2rem",
        background: "linear-gradient(135deg, rgba(212,168,95,0.1) 0%, rgba(212,168,95,0.05) 100%)",
        borderLeft: "4px solid var(--sc-gold)",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--sc-gold)",
          }}
        >
          Birth Time Discovery (Optional)
        </h3>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: "none",
              border: "none",
              color: "var(--sc-stone)",
              cursor: "pointer",
              fontSize: "1.2rem",
              opacity: 0.6,
            }}
          >
            ✕
          </button>
        )}
      </div>

      <p
        style={{
          margin: "0 0 1rem 0",
          fontSize: "0.95rem",
          color: "var(--sc-ivory)",
          lineHeight: 1.7,
        }}
      >
        Right now, your reading doesn't include Rising sign, Houses, or Human Design Authority—these require exact birth time. If you can find your birth time, we can unlock a much deeper reading.
      </p>

      <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "6px", marginBottom: "1rem" }}>
        <p
          style={{
            margin: "0 0 0.75rem 0",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            color: "var(--sc-gold)",
            letterSpacing: "0.05em",
          }}
        >
          Where to look (in order)
        </p>
        <ol
          style={{
            margin: 0,
            paddingLeft: "1.5rem",
            fontSize: "0.9rem",
            color: "var(--sc-ivory)",
            lineHeight: 1.8,
          }}
        >
          <li>
            <strong>Birth Certificate</strong> — Most reliable. Hospital recorded time within 1-15 minutes of actual birth.
          </li>
          <li>
            <strong>Hospital Records</strong> — If you can request them. Often more precise than the birth certificate.
          </li>
          <li>
            <strong>Parent Recall</strong> — "It was morning," "around noon," etc. Better than nothing, but can be ±30 minutes off.
          </li>
          <li>
            <strong>Family Bible/Records</strong> — Sometimes written down at the time by a parent or relative.
          </li>
        </ol>
      </div>

      <p
        style={{
          margin: "0 0 0.5rem 0",
          fontSize: "0.85rem",
          textTransform: "uppercase",
          color: "var(--sc-stone)",
          opacity: 0.7,
          letterSpacing: "0.05em",
        }}
      >
        Why this matters
      </p>
      <p
        style={{
          margin: "0 0 1rem 0",
          fontSize: "0.9rem",
          color: "var(--sc-ivory)",
          lineHeight: 1.6,
        }}
      >
        The Ascendant (Rising sign) moves about 1 degree every 4 minutes. A 5-minute difference in birth time can shift your Rising sign. With exact time, we can calculate your Houses, determine your Human Design Authority, and give you your True North Node.
      </p>

      <button
        style={{
          padding: "0.75rem 1.5rem",
          background: "rgba(212,168,95,0.2)",
          border: "1px solid var(--sc-gold)",
          borderRadius: "6px",
          color: "var(--sc-gold)",
          cursor: "pointer",
          fontSize: "0.9rem",
          fontWeight: 500,
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(212,168,95,0.3)";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(212,168,95,0.2)";
        }}
      >
        I'll Look Into This
      </button>
    </div>
  );
}
