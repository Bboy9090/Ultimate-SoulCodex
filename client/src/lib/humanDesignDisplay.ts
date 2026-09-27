type AnyRecord = Record<string, unknown>;

function finiteNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeHumanDesignCenters(value: unknown): { defined: string[]; undefined: string[] } {
  if (!value || typeof value !== "object") return { defined: [], undefined: [] };
  const centers = value as AnyRecord;

  if (Array.isArray(centers.defined) || Array.isArray(centers.undefined)) {
    return {
      defined: Array.isArray(centers.defined) ? centers.defined.map(String).filter(Boolean) : [],
      undefined: Array.isArray(centers.undefined) ? centers.undefined.map(String).filter(Boolean) : [],
    };
  }

  const defined: string[] = [];
  const undefinedCenters: string[] = [];
  for (const [name, row] of Object.entries(centers)) {
    if (!row || typeof row !== "object") continue;
    if ((row as AnyRecord).defined === true) defined.push(name);
    if ((row as AnyRecord).defined === false) undefinedCenters.push(name);
  }
  return { defined, undefined: undefinedCenters };
}

export function humanDesignDefinedChannels(values: unknown): unknown[] {
  if (!Array.isArray(values)) return [];
  return values.filter((value) => {
    if (typeof value === "string") return Boolean(value.trim());
    if (!value || typeof value !== "object") return false;
    const defined = (value as AnyRecord).defined;
    return defined === undefined ? true : defined === true;
  });
}

export function humanDesignChannelLabel(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return String(value ?? "").trim();

  const row = value as AnyRecord;
  const gates = Array.isArray(row.gates)
    ? row.gates.map(finiteNumber).filter((gate): gate is number => gate !== null)
    : [];
  const gatePair = gates.length === 2 ? gates.sort((a, b) => a - b).join("-") : "";
  const key = typeof row.key === "string" ? row.key.trim() : "";
  const name = typeof row.name === "string" ? row.name.trim() : "";
  return [gatePair || key, name].filter(Boolean).join(" · ") || "Structured channel";
}

export function humanDesignGateLabel(value: unknown): string {
  const primitive = finiteNumber(value);
  if (primitive !== null) return String(primitive);
  if (!value || typeof value !== "object") return String(value ?? "").trim();

  const row = value as AnyRecord;
  const gate = finiteNumber(row.gate ?? row.number ?? row.id);
  const line = finiteNumber(row.line);
  const name = typeof row.name === "string" ? row.name.trim() : "";
  const gatePart = gate === null ? "" : line === null ? String(gate) : `${gate}.${line}`;
  return [gatePart, name].filter(Boolean).join(" · ") || "Structured gate";
}

export function humanDesignListLabel(
  values: unknown,
  kind: "channel" | "gate",
  emptyLabel = "None resolved",
): string {
  const normalizedValues = kind === "channel" ? humanDesignDefinedChannels(values) : Array.isArray(values) ? values : [];
  if (normalizedValues.length === 0) return emptyLabel;
  const formatter = kind === "channel" ? humanDesignChannelLabel : humanDesignGateLabel;
  return normalizedValues.map(formatter).filter(Boolean).join(", ") || emptyLabel;
}
