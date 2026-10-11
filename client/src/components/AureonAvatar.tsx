import portrait from "@/assets/aureon-celestial-elder.png";
import "./AureonAvatar.css";

/** Approved Celestial Elder artwork. Presentation only; never a source of chart evidence. */
export default function AureonAvatar() {
  return (
    <figure className="aureon-avatar" aria-label="Aureon, your celestial guide">
      <div className="aureon-avatar-portrait">
        <img src={portrait} alt="Aureon, a silver-blue alien elder with amber eyes and a sweeping crest" width={80} height={80} decoding="async" />
      </div>
      <figcaption>Aureon</figcaption>
    </figure>
  );
}
