import portrait from "@/assets/aureon-celestial-elder.png";
import { motion, useReducedMotion } from "framer-motion";
import "./AureonAvatar.css";

export type AureonState = "observing" | "explaining" | "comparing" | "confirming";

const STATE_LABEL: Record<AureonState, string> = {
  observing: "observing",
  explaining: "explaining",
  comparing: "comparing",
  confirming: "confirmed",
};

/** Approved Celestial Elder artwork. Presentation only; never a source of chart evidence. */
export default function AureonAvatar({
  state = "observing",
  compact = false,
}: {
  state?: AureonState;
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.figure
      className={`aureon-avatar aureon-avatar--${state} ${compact ? "aureon-avatar--compact" : ""}`}
      aria-label={`Aureon, your celestial guide, ${STATE_LABEL[state]}`}
      initial={reducedMotion ? false : { opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="aureon-avatar-portrait"
        animate={reducedMotion ? undefined : state === "explaining"
          ? { y: [0, -2, 0], scale: [1, 1.015, 1] }
          : state === "comparing"
            ? { rotate: [0, -1.5, 1.5, 0] }
            : state === "confirming"
              ? { scale: [1, 1.035, 1] }
              : { y: [0, -1.5, 0] }}
        transition={reducedMotion ? undefined : {
          duration: state === "comparing" ? 3.2 : 4.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img src={portrait} alt="Aureon, a silver-blue alien elder with amber eyes and a sweeping crest" width={80} height={80} decoding="async" />
        <span className="aureon-avatar-signal" aria-hidden="true" />
      </motion.div>
      <figcaption>
        <span>Aureon</span>
        <span className="aureon-avatar-state">{STATE_LABEL[state]}</span>
      </figcaption>
    </motion.figure>
  );
}
