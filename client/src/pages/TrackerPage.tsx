import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { IconLock, IconCheckCircle, IconActivity } from "../components/Icons";
import { cleanCodexLine } from "../lib/soul-codex/utils/cleanCodexLine";
import { getRecentDailyPulseEntries, getDailyPulseSummary } from "../lib/dailyPulseStorage";

interface FrequencyLog {
  id: number;
  frequency: number;
  notes: string | null;
  createdAt: string;
}

interface CongruenceData {
  score: number;
  interpretation: string;
  purposeStatement?: string;
}

export default function TrackerPage() {
  const [selectedFreq, setSelectedFreq] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [showLogged, setShowLogged] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [pulseEntries, setPulseEntries] = useState<any[]>([]);
  const [pulseSummary, setPulseSummary] = useState<any>(null);

  useEffect(() => {
    const entries = getRecentDailyPulseEntries(7);
    setPulseEntries(entries);
    const summary = getDailyPulseSummary(7);
    setPulseSummary(summary);
  }, []);

  const { data: logs = [] } = useQuery<FrequencyLog[]>({
    queryKey: ["/api/frequency/logs"],
    select: (data: any) => Array.isArray(data) ? data : (data?.logs ?? []),
  });

  const { data: congruence, error: congruenceError } = useQuery<CongruenceData>({
    queryKey: ["/api/congruence"],
    retry: false,
  });

  const logMutation = useMutation({
    mutationFn: async (payload: { frequency: number; notes?: string }) => {
      await apiRequest("/api/frequency/log", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frequency/logs"] });
      setShowLogged(true);
      setTimeout(() => setShowLogged(false), 2000);
      setSelectedFreq(null);
      setNotes("");
    },
    onError: (err: any) => {
      console.error("Failed to log frequency", err);
    },
  });

  const purposeMutation = useMutation({
    mutationFn: async (newPurpose: string) => {
      await apiRequest("/api/profile/purpose", {
        method: "PATCH",
        body: JSON.stringify({ purpose: newPurpose }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/congruence"] });
    },
  });

  useEffect(() => {
    if (congruence?.purposeStatement) {
      setPurpose(congruence.purposeStatement);
    }
  }, [congruence?.purposeStatement]);

  const handleLog = () => {
    if (selectedFreq === null) return;
    logMutation.mutate({ frequency: selectedFreq, notes: notes.trim() || undefined });
  };

  const getFreqColor = (val: number) => {
    if (val <= 3) return "var(--destructive)";
    if (val <= 6) return "var(--cosmic-amber)";
    return "var(--cosmic-teal)";
  };

  const isAuthError = congruenceError && (congruenceError as any).status === 401;

  return (
    <div className="container max-w-2xl py-8 space-y-8 animate-fade-in">
      <header className="text-center space-y-2">
        <h1 className="font-serif text-3xl text-cosmic-gold">Life Current Tracker</h1>
        <p className="text-muted-foreground">Monitor your daily resonance and alignment.</p>
      </header>

      {/* Log Section */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconActivity size={20} className="text-cosmic-purple" />
            Daily Frequency
          </h2>
          {showLogged && (
            <span className="flex items-center gap-1 text-cosmic-teal text-sm font-medium animate-pulse">
              <IconCheckCircle size={16} /> Logged
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
            <button
              key={val}
              onClick={() => setSelectedFreq(val)}
              className={`h-12 rounded-lg font-bold transition-all border-2 ${
                selectedFreq === val
                  ? "scale-110 shadow-lg border-white"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              style={{
                backgroundColor: getFreqColor(val),
                color: "white",
              }}
            >
              {val}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 200))}
            placeholder="Notes on today's energy... (optional)"
            className="input min-h-[80px] text-sm resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{notes.length}/200</span>
            <button
              onClick={handleLog}
              disabled={selectedFreq === null || logMutation.isPending}
              className="btn btn-primary px-8"
            >
              {logMutation.isPending ? "Logging..." : "Log Pulse"}
            </button>
          </div>
        </div>
      </div>

      {/* Congruence Ring */}
      <div className="glass-card p-8 flex flex-col items-center text-center space-y-6">
        <h2 className="text-xl font-semibold">Congruence Score</h2>
        
        {isAuthError ? (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-muted flex items-center justify-center opacity-50">
              <IconLock size={32} />
            </div>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Sign in to unlock your Congruence Score analysis.
            </p>
            <a href="/start" style={{ textDecoration: "none" }}>
              <button className="btn btn-secondary text-xs">Sign In / Create Account</button>
            </a>
          </div>
        ) : congruence ? (
          <div className="space-y-6 w-full">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-muted opacity-20"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="var(--cosmic-purple)"
                  strokeWidth="10"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (congruence.score / 100) * 440}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold font-display">{congruence.score}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-serif italic text-cosmic-lavender">
                "{cleanCodexLine(congruence.interpretation, "Calibration in progress — focus on the signals you have while the pattern solidifies.")}"
              </p>
            </div>

            <div className="pt-4 border-t border-border/30 w-full">
              <label className="label text-xs text-left">LIFETIME PURPOSE STATEMENT</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                onBlur={() => purposeMutation.mutate(purpose)}
                placeholder="Declare your soul's intent..."
                className="input bg-transparent border-dashed border-muted-foreground/30 focus:border-solid italic"
              />
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center animate-pulse">
             <div className="w-32 h-32 rounded-full border-4 border-muted/20" />
          </div>
        )}
      </div>

      {/* Daily Pulse Section */}
      <div className="glass-card p-6 space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <IconActivity size={20} style={{ color: "var(--sc-gold)" }} />
          Daily Pulse History
        </h2>

        {pulseEntries.length > 0 ? (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  Avg Energy
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--sc-ivory)" }}>
                  {pulseSummary?.avgEnergy.toFixed(1)}
                </div>
              </div>
              <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  Avg Alignment
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--sc-ivory)" }}>
                  {pulseSummary?.avgAlignment.toFixed(1)}
                </div>
              </div>
              <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  Top Mood
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--sc-gold)", textTransform: "capitalize" }}>
                  {pulseSummary?.mostCommonMood || "—"}
                </div>
              </div>
            </div>

            {/* Recent Entries */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "300px", overflowY: "auto" }}>
              {pulseEntries.map((entry) => (
                <div key={entry.date} style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", borderLeft: "3px solid var(--sc-gold)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--sc-ivory)" }}>
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--sc-stone)" }}>
                      <span>E: {entry.energy}/5</span>
                      <span>A: {entry.alignment}/5</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", background: "rgba(212, 168, 95, 0.2)", borderRadius: "12px", color: "var(--sc-gold)", fontWeight: 500, textTransform: "capitalize" }}>
                      {entry.mood}
                    </span>
                    {entry.note && (
                      <span style={{ fontSize: "0.8rem", color: "var(--sc-stone)", fontStyle: "italic" }}>
                        "{entry.note.substring(0, 40)}{entry.note.length > 40 ? "..." : ""}"
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <p style={{ color: "var(--sc-stone)", fontSize: "0.9rem" }}>
              No pulses logged yet. Start from the Today page.
            </p>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="glass-card p-6 space-y-6">
        <h2 className="text-xl font-semibold">14-Day Trajectory</h2>
        
        {logs.length > 0 ? (
          <div className="space-y-6">
            <div className="h-32 flex items-end justify-between gap-1 px-2 pt-4">
              {Array.from({ length: 14 }).map((_, idx) => {
                const log = logs[logs.length - 14 + idx];
                const height = log ? (log.frequency / 10) * 100 : 0;
                const date = log ? new Date(log.createdAt) : null;
                const dayLabel = date ? date.toLocaleDateString('en-US', { weekday: 'short' })[0] : '';

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {log && (
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="bg-popover text-popover-foreground text-[10px] p-1.5 rounded border border-border whitespace-nowrap shadow-xl">
                          <div className="font-bold">{log.frequency}/10</div>
                          <div className="opacity-70">{new Date(log.createdAt).toLocaleDateString()}</div>
                          {log.notes && <div className="mt-1 italic border-t border-border pt-1">"{log.notes}"</div>}
                        </div>
                      </div>
                    )}
                    <div 
                      className="w-full min-h-[4px] rounded-t-sm transition-all duration-500 hover:brightness-125"
                      style={{ 
                        height: `${height}%`,
                        backgroundColor: log ? getFreqColor(log.frequency) : 'rgba(255,255,255,0.05)'
                      }}
                    />
                    <span className="text-[10px] font-mono text-muted-foreground">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--destructive)' }} /> Low</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--cosmic-amber)' }} /> Mid</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--cosmic-teal)' }} /> Peak</span>
            </div>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-muted/20 rounded-xl">
            <p className="text-sm text-muted-foreground">No logs yet — track your first day above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
