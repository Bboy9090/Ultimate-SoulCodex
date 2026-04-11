/**
 * Natal Chart + Human Design PDF Report — Soul Codex edition
 * Dark teal background · gold accents · ivory text
 */

import PDFDocument from "pdfkit";

export interface NatalReportInput {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  astrology: any;
  humanDesign: any;
  aiText: NatalReportAIText;
  comparables?: SoulComparables;
}

export interface NatalReportAIText {
  overview: string;
  bigThreeSun: string;
  bigThreeMoon: string;
  bigThreeRising: string;
  whatStandsOut: string[];
  workingInterpretation: string;
  elementEmphasis: string;
  houseEmphasis: string;
  bottomLine: string;
  hdInterpretation: string;
}

export interface SoulComparable {
  name: string;
  why: string;
}

export interface SoulComparables {
  animal: SoulComparable;
  deity: SoulComparable;
  historical: SoulComparable;
  icon: SoulComparable;
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const PAGE_W     = 612;
const PAGE_H     = 792;
const MARGIN_L   = 52;
const MARGIN_R   = 52;
const CONTENT_W  = PAGE_W - MARGIN_L - MARGIN_R;

// Palette
const BG         = "#071318";   // deep teal-black
const BG_CARD    = "#0d2030";   // card row even
const BG_ALT     = "#0a1a28";   // card row odd
const BG_HEADER  = "#0e2a1a";   // table header row — dark green-teal
const GOLD       = "#D4A85F";
const GOLD_DIM   = "#9a7840";
const IVORY      = "#F2EDE3";
const IVORY_DIM  = "#a89f94";
const TEAL_LIGHT = "#5ac8d8";
const DIVIDER    = "#1e3d4a";

// ── Helpers ───────────────────────────────────────────────────────────────────

function deg(d: number): string {
  const whole = Math.floor(d);
  const min   = Math.round((d - whole) * 60);
  return `${whole}°${String(min).padStart(2, "0")}'`;
}

function ordinal(n: number): string {
  if (!n) return "—";
  const s = ["th","st","nd","rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function cap(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Fill entire page with background color */
function fillBg(doc: PDFKit.PDFDocument) {
  doc.rect(0, 0, PAGE_W, PAGE_H).fillColor(BG).fill();
}

/** Scatter star dots across the page */
function drawStars(doc: PDFKit.PDFDocument) {
  const stars: [number, number, number][] = [
    [42,30,1],[130,18,0.7],[250,42,1.2],[390,12,0.8],[510,38,1],[590,20,0.7],
    [70,85,0.8],[180,72,1.1],[315,90,0.7],[450,68,0.9],[560,82,1],[610,95,0.7],
    [28,145,1],[140,130,0.8],[280,155,1.2],[420,140,0.7],[545,150,1],[598,138,0.8],
    [55,210,0.7],[175,220,1],[310,200,0.8],[460,215,0.9],[575,205,0.7],[605,222,1],
    [38,275,1],[155,260,0.8],[300,280,1.1],[440,268,0.7],[558,275,0.9],[602,260,0.7],
    [20,340,0.7],[168,352,1],[315,335,0.8],[468,348,1.1],[577,340,0.8],[605,355,0.7],
    [45,420,1],[170,408,0.7],[308,425,0.9],[452,415,0.8],[570,422,1],[608,410,0.7],
    [30,490,0.8],[165,478,1],[312,492,0.7],[455,482,1.1],[572,490,0.8],[607,475,0.7],
    [48,550,0.9],[180,565,0.7],[328,548,1],[462,558,0.8],[576,552,0.9],[610,567,0.7],
    [35,620,0.7],[172,638,1],[322,622,0.8],[468,632,0.9],[580,625,0.7],[608,638,1],
    [52,700,1],[185,715,0.7],[330,702,0.9],[472,712,0.8],[582,700,1],[606,718,0.7],
    [40,762,0.8],[178,775,1],[332,760,0.7],[474,772,0.9],[584,762,0.8],[607,778,0.7],
  ];
  stars.forEach(([sx, sy, sr]) => {
    const opacity = 0.18 + sr * 0.18;
    doc.circle(sx, sy, sr).fillColor("#ffffff").fillOpacity(opacity).fill().fillOpacity(1);
  });
}

/** Gold horizontal rule */
function goldRule(doc: PDFKit.PDFDocument, x0 = MARGIN_L, x1 = PAGE_W - MARGIN_R) {
  const y = doc.y;
  doc.moveTo(x0, y).lineTo(x1, y).strokeColor(GOLD_DIM).strokeOpacity(0.4).lineWidth(0.5).stroke().strokeOpacity(1);
}

/** Section heading: gold label on dark bar */
function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.65);
  const y = doc.y;
  doc.rect(MARGIN_L, y, CONTENT_W, 20).fillColor(BG_HEADER).fill();
  doc.moveTo(MARGIN_L, y).lineTo(PAGE_W - MARGIN_R, y).strokeColor(GOLD_DIM).strokeOpacity(0.45).lineWidth(0.7).stroke().strokeOpacity(1);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD)
     .text(title.toUpperCase(), MARGIN_L + 8, y + 6, { width: CONTENT_W - 16, lineBreak: false });
  doc.y = y + 24;
  doc.moveDown(0.2);
}

/** Draw a single table row and return next y */
function tableRow(
  doc: PDFKit.PDFDocument,
  cols: string[],
  widths: number[],
  x0: number,
  y0: number,
  opts: { header?: boolean; shade?: boolean; rowH?: number }
): number {
  const ROW_H = opts.rowH ?? 18;
  const fill  = opts.header ? BG_HEADER : opts.shade ? BG_ALT : BG_CARD;
  const color = opts.header ? GOLD : IVORY;

  doc.rect(x0, y0, widths.reduce((a, b) => a + b, 0), ROW_H).fillColor(fill).fill();

  let cx = x0;
  cols.forEach((text, i) => {
    doc.font(opts.header ? "Helvetica-Bold" : "Helvetica")
       .fontSize(opts.header ? 8 : 9)
       .fillColor(color)
       .text(text, cx + 6, y0 + 5, { width: widths[i] - 12, lineBreak: false });
    cx += widths[i];
  });
  return y0 + ROW_H;
}

/** Page footer */
function addFooter(doc: PDFKit.PDFDocument, name: string, page: number) {
  const y = PAGE_H - 26;
  doc.moveTo(MARGIN_L, y - 6).lineTo(PAGE_W - MARGIN_R, y - 6)
     .strokeColor(GOLD_DIM).strokeOpacity(0.25).lineWidth(0.4).stroke().strokeOpacity(1);
  doc.font("Helvetica").fontSize(7.5).fillColor(IVORY_DIM)
     .text(`Soul Codex  ·  ${name}  ·  Natal Chart + Human Design`, MARGIN_L, y, { width: CONTENT_W - 50, align: "left" })
     .text(`${page}`, PAGE_W - MARGIN_R - 20, y, { width: 20, align: "right" });
}

// ── Main builder ──────────────────────────────────────────────────────────────

export function buildNatalReportPdf(input: NatalReportInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 0,
      info: {
        Title: `${input.name} — Natal Chart + Human Design`,
        Author: "Soul Codex",
        Subject: "Natal chart and Human Design reading",
        Keywords: "astrology, natal chart, human design, soul codex",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const astro  = input.astrology  ?? {};
    const hd     = input.humanDesign ?? {};
    const ai     = input.aiText;
    let pageNum  = 1;

    // ══════════════════════════════════════════════════════════════════════════
    // COVER PAGE
    // ══════════════════════════════════════════════════════════════════════════

    fillBg(doc);
    drawStars(doc);

    // Top gold rule
    doc.moveTo(MARGIN_L, 52).lineTo(PAGE_W - MARGIN_R, 52)
       .strokeColor(GOLD).strokeOpacity(0.55).lineWidth(0.8).stroke().strokeOpacity(1);

    // App name
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD)
       .text("S O U L   C O D E X", 0, 60, { width: PAGE_W, align: "center", characterSpacing: 2 });

    // Decorative diamonds
    doc.font("Helvetica").fontSize(10).fillColor(GOLD_DIM)
       .text("✦", 0, 76, { width: PAGE_W, align: "center" });

    // Large center block
    const centerY = 260;

    // Name
    doc.font("Helvetica-Bold").fontSize(36).fillColor(IVORY)
       .text(input.name || "Your Name", 0, centerY, { width: PAGE_W, align: "center" });

    doc.moveDown(0.45);
    doc.font("Helvetica").fontSize(11).fillColor(GOLD)
       .text("NATAL CHART + HUMAN DESIGN", 0, doc.y, { width: PAGE_W, align: "center", characterSpacing: 1.5 });

    // Thin gold divider
    doc.moveDown(0.7);
    const dY = doc.y;
    doc.moveTo(PAGE_W / 2 - 80, dY).lineTo(PAGE_W / 2 + 80, dY)
       .strokeColor(GOLD).strokeOpacity(0.4).lineWidth(0.6).stroke().strokeOpacity(1);

    doc.moveDown(0.9);
    doc.font("Helvetica").fontSize(10).fillColor(IVORY_DIM)
       .text(formatBirthData(input), 0, doc.y, { width: PAGE_W, align: "center" });

    // Big Three callout
    const sunSign  = astro?.planets?.sun?.sign  ?? astro?.sunSign  ?? "–";
    const moonSign = astro?.planets?.moon?.sign ?? astro?.moonSign ?? "–";
    const rising   = astro?.risingSign ?? astro?.rising ?? "–";

    const bigThreeY = 470;
    doc.rect(MARGIN_L + 40, bigThreeY, CONTENT_W - 80, 72).fillColor(BG_CARD).fill();
    doc.moveTo(MARGIN_L + 40, bigThreeY).lineTo(MARGIN_L + 40 + CONTENT_W - 80, bigThreeY)
       .strokeColor(GOLD).strokeOpacity(0.35).lineWidth(0.6).stroke().strokeOpacity(1);
    doc.moveTo(MARGIN_L + 40, bigThreeY + 72).lineTo(MARGIN_L + 40 + CONTENT_W - 80, bigThreeY + 72)
       .strokeColor(GOLD).strokeOpacity(0.35).lineWidth(0.6).stroke().strokeOpacity(1);

    const colW = (CONTENT_W - 80) / 3;
    const colX = MARGIN_L + 40;
    const bigThreeItems = [
      { label: "SUN", value: sunSign },
      { label: "MOON", value: moonSign },
      { label: "RISING", value: rising },
    ];
    bigThreeItems.forEach((item, i) => {
      const x = colX + i * colW;
      doc.font("Helvetica").fontSize(7.5).fillColor(IVORY_DIM)
         .text(item.label, x, bigThreeY + 14, { width: colW, align: "center", characterSpacing: 2 });
      doc.font("Helvetica-Bold").fontSize(16).fillColor(IVORY)
         .text(item.value, x, bigThreeY + 28, { width: colW, align: "center" });
      if (i < 2) {
        doc.moveTo(colX + (i + 1) * colW, bigThreeY + 10).lineTo(colX + (i + 1) * colW, bigThreeY + 62)
           .strokeColor(GOLD_DIM).strokeOpacity(0.3).lineWidth(0.5).stroke().strokeOpacity(1);
      }
    });

    // Life path
    const lpNum = astro?.numerology?.lifePathNumber ?? (input as any).lifePathNumber;
    if (lpNum) {
      doc.font("Helvetica").fontSize(8).fillColor(IVORY_DIM)
         .text("LIFE PATH", 0, 570, { width: PAGE_W, align: "center", characterSpacing: 2 });
      doc.font("Helvetica-Bold").fontSize(52).fillColor(GOLD)
         .text(String(lpNum), 0, 582, { width: PAGE_W, align: "center" });
    }

    // Bottom rule
    doc.moveTo(MARGIN_L, PAGE_H - 48).lineTo(PAGE_W - MARGIN_R, PAGE_H - 48)
       .strokeColor(GOLD).strokeOpacity(0.55).lineWidth(0.8).stroke().strokeOpacity(1);
    doc.font("Helvetica").fontSize(7.5).fillColor(IVORY_DIM)
       .text(`Generated by Soul Codex  ·  ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
         0, PAGE_H - 38, { width: PAGE_W, align: "center", characterSpacing: 1 });

    addFooter(doc, input.name, pageNum);

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 2 — Overview + Big Three
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage({ margin: 0 }); pageNum++;
    fillBg(doc); drawStars(doc);
    addPageHeader(doc, "Natal Chart Overview", pageNum);

    // Overview text
    sectionTitle(doc, "Overview");
    doc.font("Helvetica").fontSize(10).fillColor(IVORY)
       .text(ai.overview, MARGIN_L, doc.y, { width: CONTENT_W, align: "left", lineGap: 3 });

    // Core snapshot
    doc.moveDown(0.7);
    const snapData = astro?.planets ?? {};
    const snapshotText = [
      snapData.sun  ? `☉ ${snapData.sun.sign} ${deg(snapData.sun.degree ?? 0)}`  : null,
      snapData.moon ? `☽ ${snapData.moon.sign} ${deg(snapData.moon.degree ?? 0)}` : null,
      rising !== "–" ? `ASC ${rising}` : null,
    ].filter(Boolean).join("    ·    ");

    const snapY = doc.y;
    doc.rect(MARGIN_L, snapY, CONTENT_W, 26).fillColor(BG_CARD).fill();
    doc.moveTo(MARGIN_L, snapY).lineTo(PAGE_W - MARGIN_R, snapY)
       .strokeColor(GOLD).strokeOpacity(0.25).lineWidth(0.5).stroke().strokeOpacity(1);
    doc.font("Helvetica").fontSize(9.5).fillColor(GOLD)
       .text(snapshotText, MARGIN_L + 10, snapY + 9, { width: CONTENT_W - 20, align: "center", lineBreak: false });
    doc.y = snapY + 32;

    // Big Three table
    sectionTitle(doc, "The Big Three");
    const bigCols = [180, CONTENT_W - 180];
    let ty = doc.y;
    ty = tableRow(doc, ["Placement", "Interpretation"], bigCols, MARGIN_L, ty, { header: true });

    const btRows = [
      [`☉ Sun in ${sunSign}`, ai.bigThreeSun],
      [`☽ Moon in ${moonSign}`, ai.bigThreeMoon],
      [`↑ ${rising} Rising`, ai.bigThreeRising],
    ];
    btRows.forEach(([label, interp], i) => {
      const MULTI_H = 42;
      const fill = i % 2 === 0 ? BG_CARD : BG_ALT;
      doc.rect(MARGIN_L, ty, CONTENT_W, MULTI_H).fillColor(fill).fill();
      doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD)
         .text(label, MARGIN_L + 6, ty + 6, { width: bigCols[0] - 12, lineBreak: true });
      doc.font("Helvetica").fontSize(9).fillColor(IVORY)
         .text(interp, MARGIN_L + bigCols[0] + 6, ty + 6, { width: bigCols[1] - 12, lineBreak: true });
      ty += MULTI_H;
    });

    doc.y = ty + 4;
    addFooter(doc, input.name, pageNum);

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 3 — Planetary Placements
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage({ margin: 0 }); pageNum++;
    fillBg(doc); drawStars(doc);
    addPageHeader(doc, "Planetary Placements", pageNum);

    sectionTitle(doc, "Natal Placements");
    const placeCols = [130, 130, 80, CONTENT_W - 340];
    ty = doc.y;
    ty = tableRow(doc, ["Planet", "Sign + Degree", "House", "Notes"], placeCols, MARGIN_L, ty, { header: true });

    const PLANETS: [string, string, string][] = [
      ["☉ Sun",     "sun",     "Core identity and vital force"],
      ["☽ Moon",    "moon",    "Emotional body and inner world"],
      ["☿ Mercury", "mercury", "Mind, communication, perception"],
      ["♀ Venus",   "venus",   "Attraction, values, relationship style"],
      ["♂ Mars",    "mars",    "Drive, assertion, will"],
      ["♃ Jupiter", "jupiter", "Expansion, growth, philosophy"],
      ["♄ Saturn",  "saturn",  "Structure, mastery, karma"],
      ["♅ Uranus",  "uranus",  "Disruption, liberation, innovation"],
      ["♆ Neptune", "neptune", "Dreams, dissolving, transcendence"],
      ["♇ Pluto",   "pluto",   "Transformation, depth, power"],
    ];

    PLANETS.forEach(([label, key, note], i) => {
      const p = astro?.planets?.[key];
      if (!p) return;
      const houseStr = p.house ? ordinal(p.house) : "—";
      ty = tableRow(doc, [label, `${p.sign ?? "—"} ${deg(p.degree ?? 0)}`, houseStr, note], placeCols, MARGIN_L, ty, { shade: i % 2 === 1 });
    });

    // North Node + Chiron
    const extras: [string, any, string][] = [
      ["☊ North Node", astro?.planets?.north_node ?? astro?.northNode, "Soul direction"],
      ["⚷ Chiron",     astro?.planets?.chiron ?? astro?.chiron,        "Core wound + gift"],
    ];
    extras.forEach(([label, p, note], ii) => {
      if (!p) return;
      const houseStr = p.house ? ordinal(p.house) : "—";
      ty = tableRow(doc, [label, `${p.sign ?? "—"} ${deg(p.degree ?? 0)}`, houseStr, note], placeCols, MARGIN_L, ty, { shade: (PLANETS.length + ii) % 2 === 1 });
    });

    // House cusps (if available) — handle both {cusps:[]} and [{degree},...] shapes
    const rawHouses = astro?.houses;
    const cusps: number[] = Array.isArray(rawHouses)
      ? rawHouses.map((h: any) => h.degree)
      : (rawHouses?.cusps ?? []);
    if (cusps.length >= 12) {
      doc.y = ty + 10;
      sectionTitle(doc, "House Cusps");
      const hcCols = [60, 100, 60, 100, 60, 100, CONTENT_W - 480];
      ty = doc.y;

      // Two-row display: 1-6 then 7-12
      const houseHeaders = cusps.slice(0, 6).map((_: number, i: number) => `H${i + 1}`);
      const houseValues  = cusps.slice(0, 6).map((c: number) => {
        const sign = ZODIAC_AT(c);
        const d = Math.floor(c % 30);
        return `${sign} ${d}°`;
      });
      ty = tableRow(doc, houseHeaders, [84, 84, 84, 84, 84, 88], MARGIN_L, ty, { header: true });
      ty = tableRow(doc, houseValues,  [84, 84, 84, 84, 84, 88], MARGIN_L, ty, {});

      const houseHeaders2 = cusps.slice(6, 12).map((_: number, i: number) => `H${i + 7}`);
      const houseValues2  = cusps.slice(6, 12).map((c: number) => {
        const sign = ZODIAC_AT(c);
        const d = Math.floor(c % 30);
        return `${sign} ${d}°`;
      });
      ty = tableRow(doc, houseHeaders2, [84, 84, 84, 84, 84, 88], MARGIN_L, ty, { header: true });
      ty = tableRow(doc, houseValues2,  [84, 84, 84, 84, 84, 88], MARGIN_L, ty, { shade: true });
    }

    doc.y = ty + 4;
    addFooter(doc, input.name, pageNum);

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 4 — Aspects + Chart Themes
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage({ margin: 0 }); pageNum++;
    fillBg(doc); drawStars(doc);
    addPageHeader(doc, "Aspects + Chart Themes", pageNum);

    const aspects: any[] = astro?.aspects ?? [];
    if (aspects.length > 0) {
      sectionTitle(doc, "Natal Aspects");
      const aspCols = [90, 80, 90, 45, CONTENT_W - 305];
      ty = doc.y;
      ty = tableRow(doc, ["Planet", "Aspect", "Planet", "Orb", "Theme"], aspCols, MARGIN_L, ty, { header: true });

      const ASPECT_GLYPHS: Record<string, string> = {
        conjunction: "☌ conjunction", opposition: "☍ opposition",
        trine: "△ trine", square: "□ square", sextile: "⚹ sextile",
        quincunx: "⚻ quincunx", semisquare: "∠ semisquare",
      };
      const ASPECT_THEMES: Record<string, string> = {
        conjunction: "Fusion — amplification of energies",
        trine:       "Flow — natural ability and ease",
        sextile:     "Opportunity — effort unlocks synergy",
        square:      "Tension — growth through friction",
        opposition:  "Polarity — integration and projection",
        quincunx:    "Adjustment — adaptation required",
        semisquare:  "Subtle friction — minor irritants",
      };

      aspects.slice(0, 14).forEach((asp, i) => {
        const glyph = ASPECT_GLYPHS[asp.aspect?.toLowerCase()] ?? asp.aspect;
        const theme = ASPECT_THEMES[asp.aspect?.toLowerCase()] ?? "Planetary relationship";
        const orbStr = asp.orb != null ? `${asp.orb.toFixed(1)}°` : "—";
        ty = tableRow(doc, [cap(asp.planet1), glyph, cap(asp.planet2), orbStr, theme], aspCols, MARGIN_L, ty, { shade: i % 2 === 1 });
      });
      doc.y = ty + 8;
    }

    // Themes section
    sectionTitle(doc, "What Stands Out");
    ai.whatStandsOut.forEach((bullet) => {
      doc.font("Helvetica").fontSize(9.5).fillColor(IVORY)
         .text(`◈  ${bullet}`, MARGIN_L + 8, doc.y, { width: CONTENT_W - 8, lineGap: 2.5 });
    });

    doc.moveDown(0.6);
    sectionTitle(doc, "Working Interpretation");
    doc.font("Helvetica").fontSize(10).fillColor(IVORY)
       .text(ai.workingInterpretation, MARGIN_L, doc.y, { width: CONTENT_W, lineGap: 2.5 });

    addFooter(doc, input.name, pageNum);

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 5 — Elements + Human Design
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage({ margin: 0 }); pageNum++;
    fillBg(doc); drawStars(doc);
    addPageHeader(doc, "Elements + Human Design", pageNum);

    sectionTitle(doc, "Element Emphasis");
    doc.font("Helvetica").fontSize(10).fillColor(IVORY)
       .text(ai.elementEmphasis, MARGIN_L, doc.y, { width: CONTENT_W, lineGap: 2.5 });

    doc.moveDown(0.5);
    sectionTitle(doc, "House Emphasis");
    doc.font("Helvetica").fontSize(10).fillColor(IVORY)
       .text(ai.houseEmphasis, MARGIN_L, doc.y, { width: CONTENT_W, lineGap: 2.5 });

    // Bottom line callout
    doc.moveDown(0.7);
    const blY = doc.y;
    doc.rect(MARGIN_L, blY, CONTENT_W, 38).fillColor(BG_CARD).fill();
    doc.moveTo(MARGIN_L, blY).lineTo(PAGE_W - MARGIN_R, blY)
       .strokeColor(GOLD).strokeOpacity(0.45).lineWidth(0.7).stroke().strokeOpacity(1);
    doc.moveTo(MARGIN_L, blY + 38).lineTo(PAGE_W - MARGIN_R, blY + 38)
       .strokeColor(GOLD).strokeOpacity(0.45).lineWidth(0.7).stroke().strokeOpacity(1);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD)
       .text("Bottom line:", MARGIN_L + 10, blY + 8, { continued: true })
       .font("Helvetica").fillColor(IVORY)
       .text("  " + ai.bottomLine, { width: CONTENT_W - 20 });
    doc.y = blY + 44;

    // Human Design
    sectionTitle(doc, "Human Design");
    const hdRows: [string, string][] = [
      ["Type",              hd.type              ?? "—"],
      ["Strategy",          hd.strategy          ?? "—"],
      ["Inner Authority",   hd.authority         ?? "—"],
      ["Profile",           hd.profile           ?? "—"],
      ["Definition",        hd.definition        ?? "—"],
      ["Incarnation Cross", hd.incarnationCross  ?? "—"],
      ["Signature",         hd.signature         ?? "—"],
      ["Not-Self Theme",    hd.notSelf ?? hd.not_self ?? "—"],
    ].filter(([, v]) => v && v !== "—") as [string, string][];

    const hdCols = [160, CONTENT_W - 160];
    ty = doc.y;
    ty = tableRow(doc, ["Field", "Result"], hdCols, MARGIN_L, ty, { header: true });
    hdRows.forEach(([field, result], i) => {
      ty = tableRow(doc, [field, result], hdCols, MARGIN_L, ty, { shade: i % 2 === 1 });
    });

    doc.y = ty + 8;

    // Defined centers
    const centers = hd.definedCenters ?? hd.defined_centers ?? [];
    if (centers.length > 0) {
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(GOLD)
         .text("Defined Centers", MARGIN_L, doc.y);
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(9).fillColor(IVORY)
         .text(centers.join("  ·  "), MARGIN_L, doc.y, { width: CONTENT_W, lineGap: 2 });
      doc.moveDown(0.5);
    }

    // Channels
    const definedChannels = (hd.channels ?? []).filter((c: any) => c.defined);
    if (definedChannels.length > 0) {
      sectionTitle(doc, "Active Channels");
      ty = doc.y;
      ty = tableRow(doc, ["Channel", "Description"], hdCols, MARGIN_L, ty, { header: true });
      definedChannels.slice(0, 8).forEach((ch: any, i: number) => {
        ty = tableRow(doc, [ch.name ?? "", ch.description ?? ""], hdCols, MARGIN_L, ty, { shade: i % 2 === 1 });
      });
      doc.y = ty + 8;
    }

    addFooter(doc, input.name, pageNum);

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 6 — Human Design interpretation + closing
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage({ margin: 0 }); pageNum++;
    fillBg(doc); drawStars(doc);
    addPageHeader(doc, "Human Design Interpretation", pageNum);

    sectionTitle(doc, "Your Human Design Reading");
    doc.font("Helvetica").fontSize(10).fillColor(IVORY)
       .text(ai.hdInterpretation, MARGIN_L, doc.y, { width: CONTENT_W, lineGap: 3 });

    // Closing flourish
    doc.moveDown(2);
    const closeY = doc.y;
    doc.moveTo(MARGIN_L + 80, closeY).lineTo(PAGE_W - MARGIN_R - 80, closeY)
       .strokeColor(GOLD).strokeOpacity(0.3).lineWidth(0.5).stroke().strokeOpacity(1);
    doc.moveDown(0.7);
    doc.font("Helvetica-Bold").fontSize(11).fillColor(GOLD)
       .text("✦", 0, doc.y, { width: PAGE_W, align: "center" });
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9).fillColor(IVORY_DIM)
       .text("This reading is prepared for your inner journey.", 0, doc.y, { width: PAGE_W, align: "center" });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9).fillColor(IVORY_DIM)
       .text(`Soul Codex  ·  ${input.name}`, 0, doc.y, { width: PAGE_W, align: "center" });

    addFooter(doc, input.name, pageNum);

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 7 — Soul Comparables (optional, only if data provided)
    // ══════════════════════════════════════════════════════════════════════════
    if (input.comparables) {
      doc.addPage({ margin: 0 }); pageNum++;
      fillBg(doc); drawStars(doc);
      addPageHeader(doc, "Soul Comparables", pageNum);

      // Intro blurb
      doc.font("Helvetica").fontSize(9.5).fillColor(IVORY_DIM)
         .text(
           "Based on the full chart signature — Sun, Moon, Rising, Human Design, and Life Path — " +
           "these four comparables share the closest archetypal alignment with this profile.",
           MARGIN_L, doc.y, { width: CONTENT_W, lineGap: 2.5 }
         );
      doc.moveDown(0.8);

      const COMP_ITEMS: Array<{ key: keyof SoulComparables; label: string; glyph: string }> = [
        { key: "animal",     label: "Spirit Animal",     glyph: "●" },
        { key: "deity",      label: "Mythic Deity",      glyph: "◆" },
        { key: "historical", label: "Historical Figure", glyph: "◉" },
        { key: "icon",       label: "Cultural Icon",     glyph: "✦" },
      ];

      COMP_ITEMS.forEach((item, i) => {
        const comp = input.comparables![item.key];
        if (!comp) return;

        const cardY = doc.y;
        const CARD_H = 72;
        const shade = i % 2 === 0 ? BG_CARD : BG_ALT;

        doc.rect(MARGIN_L, cardY, CONTENT_W, CARD_H).fillColor(shade).fill();
        doc.moveTo(MARGIN_L, cardY).lineTo(MARGIN_L, cardY + CARD_H)
           .strokeColor(GOLD).strokeOpacity(0.5).lineWidth(2.5).stroke().strokeOpacity(1);

        // Category label
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(GOLD)
           .text(`${item.glyph}  ${item.label.toUpperCase()}`, MARGIN_L + 14, cardY + 10,
             { width: CONTENT_W - 28, lineBreak: false, characterSpacing: 1 });

        // Name
        doc.font("Helvetica-Bold").fontSize(13).fillColor(IVORY)
           .text(comp.name, MARGIN_L + 14, cardY + 24, { width: CONTENT_W - 28, lineBreak: false });

        // Why
        doc.font("Helvetica").fontSize(9).fillColor(IVORY_DIM)
           .text(comp.why, MARGIN_L + 14, cardY + 43, { width: CONTENT_W - 28, lineBreak: true });

        doc.y = cardY + CARD_H + 8;
      });

      // Closing line
      doc.moveDown(1.2);
      doc.moveTo(MARGIN_L + 40, doc.y).lineTo(PAGE_W - MARGIN_R - 40, doc.y)
         .strokeColor(GOLD).strokeOpacity(0.25).lineWidth(0.5).stroke().strokeOpacity(1);
      doc.moveDown(0.6);
      doc.font("Helvetica").fontSize(8).fillColor(IVORY_DIM)
         .text("These comparables reflect behavioral and archetypal alignment, not prediction.",
           0, doc.y, { width: PAGE_W, align: "center" });

      addFooter(doc, input.name, pageNum);
    }

    doc.end();
  });
}

// ── Page sub-helpers ──────────────────────────────────────────────────────────

function addPageHeader(doc: PDFKit.PDFDocument, sectionName: string, pageNum: number) {
  // Top bar
  doc.rect(0, 0, PAGE_W, 44).fillColor("#040e14").fill();
  doc.moveTo(0, 44).lineTo(PAGE_W, 44)
     .strokeColor(GOLD).strokeOpacity(0.35).lineWidth(0.7).stroke().strokeOpacity(1);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(GOLD)
     .text("SOUL CODEX", MARGIN_L, 16, { width: 100, lineBreak: false, characterSpacing: 1.5 });
  doc.font("Helvetica").fontSize(8).fillColor(IVORY_DIM)
     .text(sectionName.toUpperCase(), MARGIN_L + 100, 16, { width: CONTENT_W - 100, align: "right", lineBreak: false, characterSpacing: 1 });
  doc.y = 60;
}

function formatBirthData(input: NatalReportInput): string {
  const parts = [input.birthDate, input.birthTime, input.birthLocation].filter(Boolean);
  return parts.join("  ·  ");
}

function ZODIAC_AT(lon: number): string {
  const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  return signs[Math.floor(((lon % 360) + 360) % 360 / 30)] ?? "—";
}
