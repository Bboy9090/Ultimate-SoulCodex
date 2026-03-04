import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Lock, CheckCircle2, Activity } from "lucide-react";

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
            <Activity className="w-5 h-5 text-cosmic-purple" />
            Daily Frequency
          </h2>
          {showLogged && (
            <span className="flex items-center gap-1 text-cosmic-teal text-sm font-medium animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Logged
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
              <Lock className="w-8 h-8" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Sign in to unlock your Congruence Score analysis.
            </p>
            <button className="btn btn-secondary text-xs">Sign In / Create Account</button>
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
                "{congruence.interpretation}"
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
