import { useState, useEffect } from "react";
import { generateTimelineIntelligence, saveTimelineIntelligence, type TimelineIntelligenceSummary, type SystemSignal, type LivedSignal } from "@soulcodex/core";
import { getRecentDailyPulseEntries, getDailyPulseSummary } from "../lib/dailyPulseStorage";
import { IconCheckCircle, IconAlertCircle, IconTrendingUp } from "./Icons";

interface TimelineIntelligenceProps {
  systemSignals: SystemSignal[];
}

export default function TimelineIntelligence({ systemSignals }: TimelineIntelligenceProps) {
  const [summary, setSummary] = useState<TimelineIntelligenceSummary | null>(null);
  const [showLocked, setShowLocked] = useState(false);

  useEffect(() => {
    const pulseEntries = getRecentDailyPulseEntries(30);
    if (pulseEntries.length < 7) {
      setShowLocked(true);
      return;
    }

    // Convert Daily Pulse entries to LivedSignals
    const livedSignals: LivedSignal[] = [];

    // Energy signals
    const avgEnergy = pulseEntries.reduce((sum, e) => sum + e.energy, 0) / pulseEntries.length;
    livedSignals.push({
      dateRange: {
        start: pulseEntries[pulseEntries.length - 1].date,
        end: pulseEntries[0].date,
      },
      metric: "energy",
      value: Math.round(avgEnergy * 10) / 10,
    });

    // Alignment signals
    const avgAlignment = pulseEntries.reduce((sum, e) => sum + e.alignment, 0) / pulseEntries.length;
    livedSignals.push({
      dateRange: {
        start: pulseEntries[pulseEntries.length - 1].date,
        end: pulseEntries[0].date,
      },
      metric: "alignment",
      value: Math.round(avgAlignment * 10) / 10,
    });

    // Mood signal
    const moodCounts: Record<string, number> = {};
    pulseEntries.forEach((e) => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (dominantMood) {
      livedSignals.push({
        dateRange: {
          start: pulseEntries[pulseEntries.length - 1].date,
          end: pulseEntries[0].date,
        },
        metric: "mood",
        value: dominantMood,
      });
    }

    const intelligence = generateTimelineIntelligence(systemSignals, livedSignals, {
      sampleSize: pulseEntries.length,
    });
    setSummary(intelligence);
    saveTimelineIntelligence(intelligence);
  }, [systemSignals]);

  if (showLocked) {
    return (
      <div style={{
        padding: "2rem",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "16px",
        border: "1px dashed rgba(255,255,255,0.1)",
        textAlign: "center",
      }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "var(--sc-ivory)" }}>Timeline Intelligence</h2>
        <p style={{ color: "var(--sc-stone)", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
          Timeline Intelligence unlocks after 7 Daily Pulse entries.
        </p>
        <p style={{ color: "var(--sc-stone)", fontSize: "0.9rem", fontStyle: "italic" }}>
          Every check-in teaches Soul Codex how your lived experience compares with its predictions.
        </p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Philosophy Statement */}
      <div style={{
        padding: "1.5rem",
        background: "rgba(255,255,255,0.02)",
        borderLeft: "3px solid var(--sc-gold)",
        borderRadius: "8px",
      }}>
        <p style={{ fontSize: "0.85rem", color: "var(--sc-stone)", lineHeight: "1.6", margin: 0 }}>
          Timeline Intelligence exists to validate—not replace—your judgment. It compares deterministic system signals with lived experience. It measures. It does not persuade. It observes. It does not predict.
        </p>
      </div>

      {/* Card 1: System Signals */}
      <div style={{
        padding: "1.5rem",
        background: "rgba(255,255,255,0.04)",
        borderRadius: "12px",
        border: "1px solid rgba(212,168,95,0.2)",
      }}>
        <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "1rem", marginTop: 0 }}>System Signals</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--sc-stone)", marginBottom: "1rem" }}>
          Today the systems emphasized:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
          {summary.systemSignals.slice(0, 3).map((signal, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <IconCheckCircle size={16} style={{ color: "var(--sc-gold)", flexShrink: 0 }} />
              <span style={{ fontSize: "0.9rem", color: "var(--sc-ivory)" }}>{signal.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--sc-stone)", textTransform: "uppercase" }}>
          Confidence: <span style={{ color: "var(--sc-gold)" }}>{summary.confidence}</span>
        </div>
      </div>

      {/* Card 2: Your Reality */}
      <div style={{
        padding: "1.5rem",
        background: "rgba(255,255,255,0.04)",
        borderRadius: "12px",
        border: "1px solid rgba(212,168,95,0.2)",
      }}>
        <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "1rem", marginTop: 0 }}>Your Reality</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--sc-stone)", marginBottom: "1rem" }}>
          Last 7 Soul Pulse entries
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Average Energy</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--sc-ivory)" }}>
              {summary.livedSignals.find(s => s.metric === "energy")?.value || "—"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Average Alignment</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--sc-ivory)" }}>
              {summary.livedSignals.find(s => s.metric === "alignment")?.value || "—"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Dominant State</div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--sc-gold)", textTransform: "capitalize" }}>
              {summary.livedSignals.find(s => s.metric === "mood")?.value || "—"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Consistency</div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--sc-ivory)" }}>
              83%
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Matches */}
      {summary.matches.length > 0 && (
        <div style={{
          padding: "1.5rem",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "12px",
          border: "1px solid rgba(34,211,238,0.2)",
        }}>
          <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", color: "var(--sc-ivory)", marginBottom: "1rem", marginTop: 0 }}>Where They Matched</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {summary.matches.slice(0, 2).map((match, idx) => (
              <div key={idx} style={{ fontSize: "0.9rem", color: "var(--sc-stone)", lineHeight: "1.5" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <IconCheckCircle size={16} style={{ color: "var(--sc-teal)", flexShrink: 0, marginTop: "0.25rem" }} />
                  <span>{match.description}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--sc-stone)" }}>
            Evidence: <span style={{ color: "var(--sc-ivory)" }}>{summary.matches.length} observations</span>
          </div>
        </div>
      )}

      {/* Card 4: Divergences */}
      {summary.divergences.length > 0 && (
        <div style={{
          padding: "1.5rem",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "12px",
          border: "1px solid rgba(168,85,247,0.2)",
        }}>
          <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", color: "var(--sc-ivory)", marginBottom: "1rem", marginTop: 0 }}>Notable Differences</h3>
          {summary.divergences.slice(0, 1).map((divergence, idx) => (
            <div key={idx}>
              <p style={{ fontSize: "0.9rem", color: "var(--sc-stone)", lineHeight: "1.5", marginBottom: "1rem" }}>
                {divergence.description}
              </p>
              <div style={{ fontSize: "0.8rem", color: "var(--sc-stone)", marginBottom: "1rem" }}>
                Confidence: <span style={{ color: "var(--sc-gold)" }}>{summary.confidence}</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--sc-stone)", fontStyle: "italic" }}>
                Recommendation: Continue tracking. More entries increase confidence.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Card 5: Confidence Gauge */}
      <div style={{
        padding: "1.5rem",
        background: "rgba(255,255,255,0.04)",
        borderRadius: "12px",
        border: "1px solid rgba(212,168,95,0.2)",
        textAlign: "center",
      }}>
        <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "1.5rem", marginTop: 0 }}>Timeline Confidence</h3>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: `conic-gradient(var(--sc-gold) 0deg ${(summary.sampleSize / 100) * 360}deg, rgba(212,168,95,0.1) ${(summary.sampleSize / 100) * 360}deg 360deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(212,168,95,0.3)",
          }}>
            <div style={{
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--sc-gold)" }}>
                {Math.round((summary.sampleSize / 100) * 100)}%
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--sc-stone)", marginBottom: "0.5rem" }}>
          Based on
        </p>
        <p style={{ fontSize: "0.95rem", color: "var(--sc-ivory)", fontWeight: 600, marginBottom: "1rem" }}>
          {summary.sampleSize} Daily Pulse entries
        </p>

        <p style={{ fontSize: "0.8rem", color: "var(--sc-stone)", fontStyle: "italic", lineHeight: "1.5" }}>
          Higher confidence comes from more observations, not stronger beliefs.
        </p>
      </div>

      {/* Card 6: Observations */}
      {summary.observations.length > 0 && (
        <div style={{
          padding: "1.5rem",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", color: "var(--sc-ivory)", marginBottom: "1rem", marginTop: 0 }}>Observations</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {summary.observations.slice(0, 4).map((obs, idx) => (
              <div key={idx} style={{ fontSize: "0.85rem", color: "var(--sc-stone)", lineHeight: "1.5" }}>
                • {obs}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Suggestion */}
      {summary.nextTrackingSuggestion && (
        <div style={{
          padding: "1rem",
          background: "rgba(212,168,95,0.1)",
          borderRadius: "8px",
          border: "1px solid rgba(212,168,95,0.2)",
        }}>
          <p style={{ fontSize: "0.85rem", color: "var(--sc-stone)", margin: 0 }}>
            <span style={{ color: "var(--sc-gold)", fontWeight: 600 }}>Next step:</span> {summary.nextTrackingSuggestion}
          </p>
        </div>
      )}
    </div>
  );
}
