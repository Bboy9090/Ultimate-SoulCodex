export interface CompatibilityShareCardData {
  profile1Name: string;
  profile2Name: string;
  overallScore: number;
  scoreLabel: string;
  confidenceLabel: string;
  confidenceReason?: string;
  strongestInsight?: string;
  watchPoint?: string;
  systemsUsed?: string[];
}

const WIDTH = 1080;
const HEIGHT = 1080;

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[char] ?? char);
}

function clean(value: string | undefined, fallback: string): string {
  return escapeXml((value || fallback).replace(/\s+/g, " ").trim());
}

function wrap(value: string | undefined, maxChars: number, maxLines: number): string[] {
  const words = (value || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars) line = candidate;
    else { if (line) lines.push(line); line = word; }
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:!?]?$/, "")}…`;
  }
  return lines.map((item) => escapeXml(item));
}

function textLines(lines: string[], x: number, y: number, gap: number, className: string): string {
  return lines.map((line, index) => `<text x="${x}" y="${y + index * gap}" class="${className}">${line}</text>`).join("");
}

export function buildCompatibilityShareCardSvg(data: CompatibilityShareCardData): string {
  const score = Math.max(0, Math.min(100, Math.round(data.overallScore)));
  const circumference = 2 * Math.PI * 142;
  const dashOffset = circumference * (1 - score / 100);
  const pair = `${clean(data.profile1Name, "Profile One")} × ${clean(data.profile2Name, "Profile Two")}`;
  const systems = (data.systemsUsed ?? []).slice(0, 5).map((system) => clean(system, "")).join(" • ");
  const strongest = wrap(data.strongestInsight, 54, 2);
  const watch = wrap(data.watchPoint, 54, 2);
  const reason = wrap(data.confidenceReason, 76, 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="bg" cx="82%" cy="5%" r="95%"><stop offset="0" stop-color="#36216a"/><stop offset=".44" stop-color="#17142f"/><stop offset="1" stop-color="#090b18"/></radialGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6BA7FF"/><stop offset=".55" stop-color="#9B8AFF"/><stop offset="1" stop-color="#D4A85F"/></linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="12" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <style>
      text{font-family:Inter,Arial,sans-serif;fill:#F6F1E8}.eyebrow{font-size:22px;font-weight:800;letter-spacing:5px;fill:#D4A85F}.pair{font-family:Georgia,serif;font-size:54px;font-weight:500}.score{font-size:116px;font-weight:800}.outof{font-size:24px;fill:#9f9ab8}.label{font-size:25px;font-weight:750;fill:#D4A85F}.badge{font-size:21px;font-weight:800;letter-spacing:2px}.section{font-size:18px;font-weight:800;letter-spacing:3px;fill:#6BA7FF}.body{font-size:27px;fill:#e7e4f2}.fine{font-size:18px;fill:#9f9ab8}.brand{font-family:Georgia,serif;font-size:24px;fill:#f4e9d6}
    </style>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <circle cx="930" cy="120" r="190" fill="#7B61FF" opacity=".10"/><circle cx="140" cy="920" r="230" fill="#6BA7FF" opacity=".06"/>
  <rect x="52" y="52" width="976" height="976" rx="42" fill="none" stroke="#D4A85F" stroke-opacity=".22"/>
  <text x="92" y="108" class="eyebrow">SOUL CODEX • COMPATIBILITY 2.0</text>
  <text x="92" y="187" class="pair">${pair}</text>
  <rect x="92" y="224" width="270" height="48" rx="24" fill="#D4A85F" fill-opacity=".13" stroke="#D4A85F" stroke-opacity=".4"/>
  <text x="227" y="256" text-anchor="middle" class="badge">${clean(data.confidenceLabel, "PARTIAL")}</text>
  <g transform="translate(540 463)">
    <circle r="142" fill="#0d1020" stroke="#ffffff" stroke-opacity=".08" stroke-width="23"/>
    <circle r="142" fill="none" stroke="url(#ring)" stroke-width="23" stroke-linecap="round" stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${dashOffset.toFixed(2)}" transform="rotate(-90)" filter="url(#glow)"/>
    <text y="25" text-anchor="middle" class="score">${score}</text><text y="68" text-anchor="middle" class="outof">OUT OF 100</text>
  </g>
  <text x="540" y="652" text-anchor="middle" class="label">${clean(data.scoreLabel, "Compatibility reading")}</text>
  <line x1="92" y1="705" x2="988" y2="705" stroke="#ffffff" stroke-opacity=".10"/>
  <text x="92" y="756" class="section">WHERE YOU FLOW</text>${textLines(strongest.length ? strongest : ["Your strongest shared pattern appears here."], 92, 799, 35, "body")}
  <text x="92" y="888" class="section">WATCH POINT</text>${textLines(watch.length ? watch : ["Clear communication keeps friction from becoming distance."], 92, 931, 35, "body")}
  ${reason.length ? textLines(reason, 92, 1001, 24, "fine") : ""}
  ${systems ? `<text x="988" y="1001" text-anchor="end" class="fine">${systems}</text>` : ""}
  <text x="92" y="1044" class="brand">A map, not a verdict.</text><text x="988" y="1044" text-anchor="end" class="fine">SOUL CODEX</text>
</svg>`;
}

export async function createCompatibilityShareCard(data: CompatibilityShareCardData): Promise<Blob> {
  const svg = buildCompatibilityShareCardSvg(data);
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH; canvas.height = HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available in this browser.");
    context.drawImage(image, 0, 0, WIDTH, HEIGHT);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG export failed.")), "image/png", 1));
  } finally { URL.revokeObjectURL(url); }
}

export async function downloadCompatibilityShareCard(data: CompatibilityShareCardData): Promise<void> {
  const blob = await createCompatibilityShareCard(data);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `soul-codex-${data.profile1Name}-${data.profile2Name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + ".png";
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
