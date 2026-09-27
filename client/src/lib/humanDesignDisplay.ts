type AnyRecord = Record<string, unknown>;

function finiteNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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
  if (!Array.isArray(values) || values.length === 0) return emptyLabel;
  const formatter = kind === "channel" ? humanDesignChannelLabel : humanDesignGateLabel;
  return values.map(formatter).filter(Boolean).join(", ") || emptyLabel;
}
