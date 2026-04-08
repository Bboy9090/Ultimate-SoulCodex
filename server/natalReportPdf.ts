/**
 * Natal Chart + Human Design PDF Report
 * Matches the format of the Bobby reference PDF.
 * Uses pdfkit for layout.
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

// ── Layout constants ─────────────────────────────────────────────────────────

const PAGE_W   = 612;   // US Letter
const PAGE_H   = 792;
const MARGIN_L = 55;
const MARGIN_R = 55;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;
const LIGHT_ROW = "#f5f4ff";
const DIVIDER   = "#9ca3af";
const PURPLE    = "#6d28d9";
const BLACK     = "#111111";
const DARK_GRAY = "#374151";
const MID_GRAY  = "#6b7280";

// ── Helpers ──────────────────────────────────────────────────────────────────

function deg(d: number): string {
  const whole = Math.floor(d);
  const min   = Math.round((d - whole) * 60);
  return `${whole}°${String(min).padStart(2, "0")}'`;
}

function planetLine(astro: any, key: string): { sign: string; degree: string; house: string } | null {
  const p = astro?.planets?.[key];
  if (!p) return null;
  return {
    sign:   p.sign ?? "–",
    degree: deg(p.degree ?? 0),
    house:  ordinal(p.house ?? 0),
  };
}

function ordinal(n: number): string {
  const s = ["th","st","nd","rd"];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

function hRule(doc: PDFKit.PDFDocument) {
  const y = doc.y;
  doc.moveTo(MARGIN_L, y).lineTo(PAGE_W - MARGIN_R, y).strokeColor(DIVIDER).lineWidth(0.5).stroke();
  doc.moveDown(0.4);
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.6)
     .font("Helvetica-Bold").fontSize(11).fillColor(BLACK)
     .text(title, MARGIN_L)
     .moveDown(0.3);
  hRule(doc);
}

function tableRow(
  doc: PDFKit.PDFDocument,
  cols: string[],
  widths: number[],
  x0: number,
  y0: number,
  opts: { header?: boolean; shade?: boolean }
) {
  const ROW_H = 18;
  const fill  = opts.header ? PURPLE : opts.shade ? LIGHT_ROW : "#ffffff";
  const color = opts.header ? "#ffffff" : BLACK;

  // Draw row background
  doc.rect(x0, y0, widths.reduce((a, b) => a + b, 0), ROW_H)
     .fillColor(fill).fill();

  let cx = x0;
  cols.forEach((text, i) => {
    doc.font(opts.header ? "Helvetica-Bold" : "Helvetica")
       .fontSize(opts.header ? 9 : 9)
       .fillColor(color)
       .text(text, cx + 5, y0 + 5, { width: widths[i] - 10, lineBreak: false });
    cx += widths[i];
  });

  return y0 + ROW_H;
}

function addFooter(doc: PDFKit.PDFDocument, name: string, page: number) {
  doc.font("Helvetica").fontSize(8).fillColor(MID_GRAY)
     .text(`${name} - Natal Chart + Human Design`, MARGIN_L, PAGE_H - 28, {
       width: CONTENT_W - 60,
       align: "left",
     })
     .text(`Page ${page}`, PAGE_W - MARGIN_R - 50, PAGE_H - 28, {
       width: 50,
       align: "right",
     });
}

// ── Main builder ─────────────────────────────────────────────────────────────

export function buildNatalReportPdf(input: NatalReportInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 0,
      info: {
        Title: `${input.name} - Natal Chart + Human Design`,
        Author: "Soul Codex",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const astro = input.astrology  ?? {};
    const hd    = input.humanDesign ?? {};
    const ai    = input.aiText;
    let pageNum = 1;

    // ── PAGE 1 ──────────────────────────────────────────────────────────────

    // Title
    doc.font("Helvetica-Bold").fontSize(16).fillColor(BLACK)
       .text("Natal Chart + Human Design Summary", MARGIN_L, 55, {
         width: CONTENT_W, align: "center",
       })
       .moveDown(0.5);

    // Birth data subtitle
    const birthStr = `Birth data used: ${input.birthDate} - ${input.birthTime} - ${input.birthLocation}`;
    doc.font("Helvetica-Oblique").fontSize(10).fillColor(DARK_GRAY)
       .text(birthStr, MARGIN_L, doc.y, { width: CONTENT_W, align: "center" })
       .moveDown(0.3);

    doc.font("Helvetica-Oblique").fontSize(9).fillColor(MID_GRAY)
       .text(
         "Astrology basis: Tropical zodiac, Placidus houses. Human Design basis: birth chart plus the design imprint approximately 88 degrees of solar arc before birth.",
         MARGIN_L, doc.y, { width: CONTENT_W, align: "center" }
       )
       .moveDown(0.7);

    hRule(doc);

    // Core snapshot box
    const rising    = astro?.risingSign ?? "–";
    const sunData   = astro?.planets?.sun;
    const moonData  = astro?.planets?.moon;
    const mc        = astro?.houses?.[9]; // 10th house cusp = Midheaven
    const coreText  = [
      `Sun: ${sunData?.sign ?? "–"} ${deg(sunData?.degree ?? 0)}`,
      `Moon: ${moonData?.sign ?? "–"} ${deg(moonData?.degree ?? 0)}`,
      `Rising: ${rising}`,
      mc ? `Midheaven: ${mc.sign} ${deg(mc.degree ?? 0)}` : null,
    ].filter(Boolean).join("  |  ");

    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLACK)
       .text("Core snapshot", MARGIN_L, doc.y)
       .moveDown(0.2);

    const boxY = doc.y;
    doc.rect(MARGIN_L, boxY, CONTENT_W, 24).fillColor(LIGHT_ROW).fill();
    doc.font("Helvetica").fontSize(9.5).fillColor(BLACK)
       .text(coreText, MARGIN_L + 8, boxY + 7, { width: CONTENT_W - 16, align: "center" });
    doc.y = boxY + 30;
    doc.moveDown(0.5);

    // Natal Chart Overview
    sectionTitle(doc, "Natal Chart Overview");
    doc.font("Helvetica").fontSize(10).fillColor(BLACK)
       .text(ai.overview, MARGIN_L, doc.y, { width: CONTENT_W, align: "left", lineGap: 2 })
       .moveDown(0.8);

    // Big Three table
    sectionTitle(doc, "Big Three");
    const bigThreeCols = [200, CONTENT_W - 200];
    let ty = doc.y;
    ty = tableRow(doc, ["Planet / Placement", "Meaning"], bigThreeCols, MARGIN_L, ty, { header: true });

    const bigThree = [
      [`Sun in ${sunData?.sign ?? "–"}\n${deg(sunData?.degree ?? 0)} - ${ordinal(sunData?.house ?? 0)} house`, ai.bigThreeSun],
      [`Moon in ${moonData?.sign ?? "–"}\n${deg(moonData?.degree ?? 0)} - ${ordinal(moonData?.house ?? 0)} house`, ai.bigThreeMoon],
      [`${rising} Rising`, ai.bigThreeRising],
    ];

    bigThree.forEach(([label, meaning], i) => {
      const MULTI_H = 38;
      const fill = i % 2 === 0 ? "#ffffff" : LIGHT_ROW;
      doc.rect(MARGIN_L, ty, CONTENT_W, MULTI_H).fillColor(fill).fill();
      doc.font("Helvetica-Bold").fontSize(9).fillColor(BLACK)
         .text(label, MARGIN_L + 5, ty + 5, { width: bigThreeCols[0] - 10, lineBreak: true });
      doc.font("Helvetica").fontSize(9).fillColor(BLACK)
         .text(meaning, MARGIN_L + bigThreeCols[0] + 5, ty + 5, { width: bigThreeCols[1] - 10, lineBreak: true });
      ty += MULTI_H;
    });

    doc.y = ty + 4;
    addFooter(doc, input.name, pageNum);

    // ── PAGE 2 ──────────────────────────────────────────────────────────────
    doc.addPage({ margin: 0 });
    pageNum++;
    doc.y = 55;

    // Main Placements table
    sectionTitle(doc, "Main Placements");
    const placeCols = [100, 180, 120];
    ty = doc.y;
    ty = tableRow(doc, ["Planet", "Sign + Degree", "House"], placeCols, MARGIN_L, ty, { header: true });

    const planets = [
      ["Sun",      "sun"],
      ["Moon",     "moon"],
      ["Mercury",  "mercury"],
      ["Venus",    "venus"],
      ["Mars",     "mars"],
      ["Jupiter",  "jupiter"],
      ["Saturn",   "saturn"],
      ["Uranus",   "uranus"],
      ["Neptune",  "neptune"],
      ["Pluto",    "pluto"],
    ];

    planets.forEach(([label, key], i) => {
      const p = astro?.planets?.[key];
      if (!p) return;
      ty = tableRow(
        doc,
        [label, `${p.sign} ${deg(p.degree ?? 0)}`, ordinal(p.house ?? 0)],
        placeCols, MARGIN_L, ty,
        { shade: i % 2 === 1 }
      );
    });

    // North Node + Chiron
    const nn = astro?.northNode;
    if (nn) {
      ty = tableRow(doc, ["North Node", `${nn.sign} ${deg(nn.degree ?? 0)}`, ordinal(nn.house ?? 0)], placeCols, MARGIN_L, ty, { shade: planets.length % 2 === 1 });
    }
    const ch = astro?.chiron;
    if (ch) {
      const shade = (planets.length + (nn ? 1 : 0)) % 2 === 1;
      ty = tableRow(doc, ["Chiron", `${ch.sign} ${deg(ch.degree ?? 0)}`, ordinal(ch.house ?? 0)], placeCols, MARGIN_L, ty, { shade });
    }

    doc.y = ty + 6;
    addFooter(doc, input.name, pageNum);

    // ── PAGE 3 ──────────────────────────────────────────────────────────────
    doc.addPage({ margin: 0 });
    pageNum++;
    doc.y = 55;

    // Natal Chart Themes
    sectionTitle(doc, "Natal Chart Themes");
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLACK)
       .text("What stands out", MARGIN_L, doc.y).moveDown(0.25);

    ai.whatStandsOut.forEach((bullet) => {
      doc.font("Helvetica").fontSize(9.5).fillColor(BLACK)
         .text(`• ${bullet}`, MARGIN_L + 10, doc.y, { width: CONTENT_W - 10, lineGap: 2 });
    });

    doc.moveDown(0.7);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLACK)
       .text("Working interpretation", MARGIN_L, doc.y).moveDown(0.3);
    doc.font("Helvetica").fontSize(10).fillColor(BLACK)
       .text(ai.workingInterpretation, MARGIN_L, doc.y, { width: CONTENT_W, lineGap: 2 });

    doc.moveDown(0.8);

    // Aspects table
    sectionTitle(doc, "Aspects");
    const aspects: any[] = astro?.aspects ?? [];
    const aspectCols = [160, CONTENT_W - 160];
    ty = doc.y;
    ty = tableRow(doc, ["Aspect", "Theme"], aspectCols, MARGIN_L, ty, { header: true });

    const ASPECT_THEMES: Record<string, string> = {
      conjunction: "Fusion of energies — amplification or tension depending on planets.",
      trine:       "Ease, flow, and natural ability between the two planetary energies.",
      sextile:     "Opportunity and complementary strengths that reward effort.",
      square:      "Friction, growth pressure, and recurring challenges to navigate.",
      opposition:  "Polarity — awareness, projection, and integration work.",
      quincunx:    "Adjustment tension — two energies that must adapt to coexist.",
    };

    const topAspects = aspects.slice(0, 12);
    topAspects.forEach((asp, i) => {
      const label = `${cap(asp.planet1)} ${asp.aspect} ${cap(asp.planet2)}`;
      const meaning = ASPECT_THEMES[asp.aspect?.toLowerCase()] ?? "Planetary relationship and interaction.";
      ty = tableRow(doc, [label, meaning], aspectCols, MARGIN_L, ty, { shade: i % 2 === 1 });
    });

    doc.y = ty + 6;

    if (doc.y > PAGE_H - 80) {
      addFooter(doc, input.name, pageNum);
      doc.addPage({ margin: 0 });
      pageNum++;
      doc.y = 55;
    }

    // Element and house emphasis
    sectionTitle(doc, "Element and house emphasis");
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLACK)
       .text("Element emphasis", MARGIN_L, doc.y).moveDown(0.2);
    doc.font("Helvetica").fontSize(10).fillColor(BLACK)
       .text(ai.elementEmphasis, MARGIN_L, doc.y, { width: CONTENT_W, lineGap: 2 });

    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLACK)
       .text("House emphasis", MARGIN_L, doc.y).moveDown(0.2);
    doc.font("Helvetica").fontSize(10).fillColor(BLACK)
       .text(ai.houseEmphasis, MARGIN_L, doc.y, { width: CONTENT_W, lineGap: 2 });

    doc.moveDown(0.8);

    // Bottom line callout box
    const blBoxY = doc.y;
    doc.rect(MARGIN_L, blBoxY, CONTENT_W, 36).fillColor(LIGHT_ROW).fill();
    doc.font("Helvetica-Bold").fontSize(9).fillColor(PURPLE)
       .text("Bottom line:", MARGIN_L + 8, blBoxY + 7, { continued: true })
       .font("Helvetica").fillColor(BLACK)
       .text(" " + ai.bottomLine, { width: CONTENT_W - 16 });
    doc.y = blBoxY + 42;

    addFooter(doc, input.name, pageNum);

    // ── PAGE 4 — Human Design ────────────────────────────────────────────────
    doc.addPage({ margin: 0 });
    pageNum++;
    doc.y = 55;

    sectionTitle(doc, "Human Design Result");
    doc.font("Helvetica").fontSize(9.5).fillColor(DARK_GRAY)
       .text("Calculated result from the provided birth data:", MARGIN_L, doc.y)
       .moveDown(0.4);

    const hdRows: [string, string][] = [
      ["Type",               hd.type           ?? "–"],
      ["Strategy",           hd.strategy        ?? "–"],
      ["Authority",          hd.authority       ?? "–"],
      ["Profile",            hd.profile         ?? "–"],
      ["Definition",         hd.definition      ?? "–"],
      ["Incarnation Cross",  hd.incarnationCross ?? "–"],
      ["Personality Sun",    hd.activations?.conscious?.sun
                              ? `${hd.activations.conscious.sun.gate}.${hd.activations.conscious.sun.line}` : "–"],
      ["Design Sun",         hd.activations?.unconscious?.sun
                              ? `${hd.activations.unconscious.sun.gate}.${hd.activations.unconscious.sun.line}` : "–"],
    ];

    const hdCols = [180, CONTENT_W - 180];
    ty = doc.y;
    ty = tableRow(doc, ["Field", "Result"], hdCols, MARGIN_L, ty, { header: true });
    hdRows.forEach(([field, result], i) => {
      ty = tableRow(doc, [field, result], hdCols, MARGIN_L, ty, { shade: i % 2 === 1 });
    });

    doc.y = ty + 10;

    // HD Channels (if any)
    const definedChannels = (hd.channels ?? []).filter((c: any) => c.defined);
    if (definedChannels.length > 0) {
      doc.font("Helvetica-Bold").fontSize(10).fillColor(BLACK)
         .text("Active Channels", MARGIN_L, doc.y).moveDown(0.3);
      ty = doc.y;
      ty = tableRow(doc, ["Channel", "Description"], hdCols, MARGIN_L, ty, { header: true });
      definedChannels.slice(0, 8).forEach((ch: any, i: number) => {
        ty = tableRow(doc, [ch.name, ch.description ?? ""], hdCols, MARGIN_L, ty, { shade: i % 2 === 1 });
      });
      doc.y = ty + 10;
    }

    doc.moveDown(0.5);
    sectionTitle(doc, "Interpretation");
    doc.font("Helvetica").fontSize(10).fillColor(BLACK)
       .text(ai.hdInterpretation, MARGIN_L, doc.y, { width: CONTENT_W, lineGap: 2 });

    doc.moveDown(1);
    doc.font("Helvetica-Oblique").fontSize(9.5).fillColor(MID_GRAY)
       .text(`Prepared for ${input.name} using the supplied birth data.`, MARGIN_L, doc.y, {
         width: CONTENT_W, align: "center",
       });

    addFooter(doc, input.name, pageNum);

    doc.end();
  });
}

function cap(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
