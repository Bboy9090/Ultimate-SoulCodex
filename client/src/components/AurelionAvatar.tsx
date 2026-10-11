import portrait from "@/assets/aurelion-celestial-elder.png";
import "./AurelionAvatar.css";

/** Approved Celestial Elder artwork. Presentation only; never a source of chart evidence. */
export default function AurelionAvatar() {
  return (
    <figure className="aurelion-avatar" aria-label="Aurelion, your celestial watcher and matcher">
      <div className="aurelion-avatar-portrait">
        <img src={portrait} alt="Aurelion, a silver-blue alien elder watcher with amber eyes and a sweeping crest" width={80} height={80} decoding="async" />
      </div>
      <figcaption>Aurelion</figcaption>
    </figure>
  );
}
