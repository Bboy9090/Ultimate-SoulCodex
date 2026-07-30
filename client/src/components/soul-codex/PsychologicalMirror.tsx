/**
 * PsychologicalMirror - Phase 3
 *
 * "What people see" vs "What they miss" structure
 * Kept because it's psychologically engaging
 * Strengthened with actual mechanisms, not generic language
 *
 * OLD:
 * "What they see: Attention to detail"
 * "What they miss: The humanitarian impulse behind it"
 *
 * NEW:
 * "What they see: Discernment, practical problem-solving, high standards"
 * "What they miss: The pressure you place on yourself to make the work useful,
 *                  meaningful, and worthy of a larger mission. The cost isn't pride—
 *                  it's the feeling that nothing is ever ready to release."
 */

interface PsychologicalMirrorProps {
  whatPeopleSee: string;
  whatTheyMiss: string;
  howTheyMissIt: string;
}

export default function PsychologicalMirror({
  whatPeopleSee,
  whatTheyMiss,
  howTheyMissIt,
}: PsychologicalMirrorProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
        padding: "2rem",
        background: "linear-gradient(135deg, rgba(76,175,80,0.08) 0%, rgba(33,150,243,0.08) 100%)",
        border: "1px solid rgba(76,175,80,0.15)",
        borderRadius: "12px",
      }}
    >
      {/* What People See */}
      <div>
        <h3
          style={{
            fontSize: "0.9rem",
            textTransform: "uppercase",
            color: "var(--sc-teal)",
            marginBottom: "1rem",
            margin: "0 0 1rem 0",
          }}
        >
          What People See
        </h3>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--sc-ivory)",
            lineHeight: "1.7",
            margin: 0,
          }}
        >
          {whatPeopleSee}
        </p>
      </div>

      {/* What They Miss */}
      <div>
        <h3
          style={{
            fontSize: "0.9rem",
            textTransform: "uppercase",
            color: "var(--sc-rose)",
            marginBottom: "1rem",
            margin: "0 0 1rem 0",
          }}
        >
          What They Miss
        </h3>
        <div>
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--sc-ivory)",
              lineHeight: "1.7",
              margin: "0 0 1rem 0",
            }}
          >
            {whatTheyMiss}
          </p>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--sc-stone)",
              lineHeight: "1.6",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            They see {whatPeopleSee.split(",")[0].toLowerCase()} and assume {howTheyMissIt.toLowerCase()}.
          </p>
        </div>
      </div>
    </div>
  );
}
