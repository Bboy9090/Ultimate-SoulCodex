import { HD_CENTERS, HD_GATES } from "@soulcodex/astrology";

type AnyRecord = Record<string, any>;

const CENTER_POSITIONS: Record<string, { x: number; y: number; shape: "triangle-up" | "triangle-down" | "diamond" | "square" }> = {
  Head: { x: 150, y: 32, shape: "triangle-up" },
  Ajna: { x: 150, y: 76, shape: "triangle-down" },
  Throat: { x: 150, y: 125, shape: "square" },
  G: { x: 150, y: 181, shape: "diamond" },
  Heart: { x: 213, y: 188, shape: "triangle-up" },
  Spleen: { x: 83, y: 231, shape: "triangle-up" },
  "Solar Plexus": { x: 217, y: 231, shape: "triangle-up" },
  Sacral: { x: 150, y: 245, shape: "square" },
  Root: { x: 150, y: 306, shape: "square" },
};

const CHANNELS: Record<string, [string, string]> = {
  "1-8": ["G", "Throat"], "2-14": ["G", "Sacral"], "3-60": ["Sacral", "Root"], "4-63": ["Ajna", "Head"],
  "5-15": ["Sacral", "G"], "6-59": ["Solar Plexus", "Sacral"], "7-31": ["G", "Throat"], "9-52": ["Sacral", "Root"],
  "10-20": ["G", "Throat"], "10-34": ["G", "Sacral"], "10-57": ["G", "Spleen"], "11-56": ["Ajna", "Throat"],
  "12-22": ["Throat", "Solar Plexus"], "13-33": ["G", "Throat"], "16-48": ["Throat", "Spleen"], "17-62": ["Ajna", "Throat"],
  "18-58": ["Spleen", "Root"], "19-49": ["Root", "Solar Plexus"], "20-34": ["Throat", "Sacral"], "20-57": ["Throat", "Spleen"],
  "21-45": ["Heart", "Throat"], "23-43": ["Throat", "Ajna"], "24-61": ["Ajna", "Head"], "25-51": ["G", "Heart"],
  "26-44": ["Heart", "Spleen"], "27-50": ["Sacral", "Spleen"], "28-38": ["Spleen", "Root"], "29-46": ["Sacral", "G"],
  "30-41": ["Solar Plexus", "Root"], "32-54": ["Spleen", "Root"], "34-57": ["Sacral", "Spleen"], "35-36": ["Throat", "Solar Plexus"],
  "37-40": ["Solar Plexus", "Heart"], "39-55": ["Root", "Solar Plexus"], "42-53": ["Sacral", "Root"], "47-64": ["Ajna", "Head"],
};

function normalizeCenters(hd: AnyRecord) {
  const centers = hd?.centers;
  const defined = new Set<string>();
  const undefinedCenters = new Set<string>();

  if (centers && typeof centers === "object") {
    if (Array.isArray(centers.defined) || Array.isArray(centers.undefined)) {
      for (const name of centers.defined ?? []) defined.add(String(name));
      for (const name of centers.undefined ?? []) undefinedCenters.add(String(name));
    } else {
      for (const [name, value] of Object.entries(centers as AnyRecord)) {
        if ((value as AnyRecord)?.defined === true) defined.add(name);
        if ((value as AnyRecord)?.defined === false) undefinedCenters.add(name);
      }
    }
  }

  for (const name of Object.keys(CENTER_POSITIONS)) {
    if (!defined.has(name) && !undefinedCenters.has(name)) undefinedCenters.add(name);
  }

  return { defined, undefined: undefinedCenters };
}

function channelKey(value: unknown): string | null {
  if (typeof value === "string") {
    const match = value.match(/\b(\d{1,2})\s*[-/]\s*(\d{1,2})\b/);
    if (!match) return null;
    return [Number(match[1]), Number(match[2])].sort((a, b) => a - b).join("-");
  }
  if (value && typeof value === "object" && Array.isArray((value as AnyRecord).gates)) {
    const gates = (value as AnyRecord).gates.map(Number).filter(Number.isFinite).sort((a: number, b: number) => a - b);
    return gates.length === 2 ? gates.join("-") : null;
  }
  return null;
}

function channelLabel(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return String(value ?? "");
  const row = value as AnyRecord;
  const gates = Array.isArray(row.gates) ? row.gates.join("-") : "";
  return [gates, row.name].filter(Boolean).join(" · ") || JSON.stringify(value);
}

function gateMeta(gate: string | number) {
  return (HD_GATES as Record<number, { name: string; center: string; keywords: string[] }>)[Number(gate)] ?? null;
}

function centerDescription(name: string): string {
  return (HD_CENTERS as Record<string, { description?: string }>)[name]?.description ?? "No governed center description is available.";
}

function activationRows(hd: AnyRecord) {
  const result: Array<{ side: string; body: string; gate: number; line: number }> = [];
  for (const side of ["conscious", "unconscious"]) {
    const rows = hd?.activations?.[side];
    if (!rows || typeof rows !== "object") continue;
    for (const [body, value] of Object.entries(rows as AnyRecord)) {
      const gate = Number((value as AnyRecord)?.gate);
      const line = Number((value as AnyRecord)?.line);
      if (Number.isFinite(gate) && Number.isFinite(line)) result.push({ side, body, gate, line });
    }
  }
  return result;
}

function shapePoints(name: string) {
  const position = CENTER_POSITIONS[name];
  if (!position) return "";
  const { x, y, shape } = position;
  if (shape === "diamond") return String(x) + "," + String(y - 20) + " " + String(x + 24) + "," + String(y) + " " + String(x) + "," + String(y + 20) + " " + String(x - 24) + "," + String(y);
  if (shape === "triangle-up") return String(x) + "," + String(y - 18) + " " + String(x + 22) + "," + String(y + 18) + " " + String(x - 22) + "," + String(y + 18);
  if (shape === "triangle-down") return String(x - 22) + "," + String(y - 18) + " " + String(x + 22) + "," + String(y - 18) + " " + String(x) + "," + String(y + 18);
  return String(x - 21) + "," + String(y - 18) + " " + String(x + 21) + "," + String(y - 18) + " " + String(x + 21) + "," + String(y + 18) + " " + String(x - 21) + "," + String(y + 18);
}

export default function HumanDesignBodygraph({ data }: { data: Record<string, any> }) {
  if (data?.status !== "verified") {
    return (
      <section className="sc-panel p-6">
        <p className="sc-eyebrow">Human Design bodygraph</p>
        <h2 className="mt-2 font-serif text-2xl">Unresolved until the governed core is verified.</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
          Soul Codex does not draw a sample bodygraph or promote candidate Human Design values into a verified chart.
        </p>
      </section>
    );
  }

  const centers = normalizeCenters(data);
  const channels = Array.isArray(data.channels) ? data.channels : [];
  const drawableChannels = channels
    .map((value: unknown) => {
      const key = channelKey(value);
      const pair = key ? CHANNELS[key] : null;
      return key && pair ? { key, pair, label: channelLabel(value) } : null;
    })
    .filter((value): value is NonNullable<typeof value> => Boolean(value));
  const gates = Array.isArray(data.activatedGates) ? data.activatedGates.map(String) : [];
  const activations = activationRows(data);

  return (
    <section className="sc-panel p-5 sm:p-6" data-testid="verified-human-design-bodygraph">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="sc-eyebrow">Verified Human Design bodygraph</p>
          <h2 className="mt-2 font-serif text-2xl text-[var(--sc-ivory)]">Centers, channels, gates, and decision architecture</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--sc-stone)]">
            The verified core covers gates, lines, Type, Strategy, Authority, Profile, channels, and centers.
            Variables and Incarnation Cross naming remain outside the verified core and are not promoted here.
          </p>
        </div>
        <span className="sc-trust-chip">HUMAN-DESIGN-CORE-v1</span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
        <div className="mx-auto w-full max-w-[330px]">
          <svg viewBox="0 0 300 345" role="img" aria-label="Verified Human Design bodygraph centers and channels" className="h-auto w-full">
            {drawableChannels.map((channel) => {
              const a = CENTER_POSITIONS[channel.pair[0]];
              const b = CENTER_POSITIONS[channel.pair[1]];
              return <line key={channel.key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--sc-gold-bright)" strokeWidth="5" opacity=".58" />;
            })}

            {Object.entries(CENTER_POSITIONS).map(([name, position]) => {
              const isDefined = centers.defined.has(name);
              return (
                <g key={name}>
                  <polygon
                    points={shapePoints(name)}
                    fill={isDefined ? "rgba(217,182,111,.28)" : "rgba(255,255,255,.025)"}
                    stroke={isDefined ? "var(--sc-gold-bright)" : "rgba(255,255,255,.24)"}
                    strokeWidth={isDefined ? "2" : "1.2"}
                  />
                  <text x={position.x} y={position.y + 3} textAnchor="middle" fill={isDefined ? "var(--sc-ivory)" : "var(--sc-stone)"} fontSize="8">
                    {name === "Solar Plexus" ? "Solar" : name}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.05)] p-3">
              <strong className="text-[var(--sc-ivory)]">Defined</strong>
              <p className="mt-1 leading-5 text-[var(--sc-stone)]">{[...centers.defined].join(", ") || "None resolved"}</p>
            </div>
            <div className="rounded-xl border border-[var(--sc-line)] bg-white/[0.02] p-3">
              <strong className="text-[var(--sc-ivory)]">Open / undefined</strong>
              <p className="mt-1 leading-5 text-[var(--sc-stone)]">{[...centers.undefined].join(", ") || "None resolved"}</p>
            </div>
          </div>
          <details className="mt-3 rounded-xl border border-[var(--sc-line)] bg-white/[0.02] p-3">
            <summary className="cursor-pointer text-xs font-semibold text-[var(--sc-ivory)]">What each center represents</summary>
            <div className="mt-3 space-y-2">
              {Object.keys(CENTER_POSITIONS).map((name) => (
                <div key={name} className="rounded-lg border border-[var(--sc-line)] px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs text-[var(--sc-ivory)]">{name}</strong>
                    <span className="text-[10px] uppercase tracking-[.08em] text-[var(--sc-gold)]">{centers.defined.has(name) ? "defined" : "open / undefined"}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-[var(--sc-stone)]">{centerDescription(name)}</p>
                </div>
              ))}
            </div>
          </details>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Type", data.type],
              ["Strategy", data.strategy],
              ["Authority", data.authority],
              ["Profile", data.profile],
              ["Definition", data.definition],
              ["Verified gates", gates.length],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-[var(--sc-line)] bg-white/[0.025] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-stone)]">{String(label)}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--sc-ivory)]">{String(value ?? "Unresolved")}</p>
              </div>
            ))}
          </div>

          <details open className="rounded-xl border border-[var(--sc-line)] bg-white/[0.02] p-4">
            <summary className="cursor-pointer font-semibold text-[var(--sc-ivory)]">Defined channels</summary>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-[var(--sc-stone)]">
              {channels.length ? channels.map((channel: unknown, index: number) => <li key={index}>{channelLabel(channel)}</li>) : <li>No defined channel was stored.</li>}
            </ul>
          </details>

          <details open className="rounded-xl border border-[var(--sc-line)] bg-white/[0.02] p-4">
            <summary className="cursor-pointer font-semibold text-[var(--sc-ivory)]">Activated gates · names, centers, and keywords</summary>
            {gates.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {gates.map((gate) => {
                  const meta = gateMeta(gate);
                  return (
                    <div key={gate} className="rounded-xl border border-[var(--sc-line)] bg-black/10 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-sm text-[var(--sc-ivory)]">Gate {gate}{meta ? " · " + meta.name : ""}</strong>
                        {meta && <span className="text-[10px] uppercase tracking-[.08em] text-[var(--sc-gold)]">{meta.center}</span>}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">
                        {meta ? meta.keywords.join(" · ") : "Verified activation; descriptive metadata unavailable."}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : <p className="mt-3 text-sm text-[var(--sc-stone)]">No verified activated gates were stored.</p>}
          </details>

          <details className="rounded-xl border border-[var(--sc-line)] bg-white/[0.02] p-4">
            <summary className="cursor-pointer font-semibold text-[var(--sc-ivory)]">Conscious and unconscious activations</summary>
            {activations.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {activations.map((row, index) => (
                  <div key={row.side + "-" + row.body + "-" + index} className="rounded-lg border border-[var(--sc-line)] px-3 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="capitalize text-[var(--sc-stone)]">{row.side} · {row.body}</span>
                      <strong className="text-[var(--sc-ivory)]">Gate {row.gate}.{row.line}</strong>
                    </div>
                    {gateMeta(row.gate) && <p className="mt-1 text-[11px] leading-5 text-[var(--sc-stone)]">{gateMeta(row.gate)?.name} · {gateMeta(row.gate)?.center} · {gateMeta(row.gate)?.keywords.join(" · ")}</p>}
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 text-sm text-[var(--sc-stone)]">Activation rows are not stored in this verified profile snapshot.</p>}
          </details>
        </div>
      </div>
    </section>
  );
}
