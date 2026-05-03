/**
 * Compatibility Report PDF Builder — Soul Codex edition
 * Dark teal background · gold accents · ivory text
 */

import PDFDocument from "pdfkit";
import type { Profile } from "../shared/schema";

export interface CompatibilityReportInput {
  profile1: Profile;
  profile2: Profile;
  compatibilityData: any;
  aiText?: {
    overview: string;
    strengths: string[];
    challenges: string[];
    bottomLine: string;
  };
  isPremium?: boolean;
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const PAGE_W     = 612;
const PAGE_H     = 792;
const MARGIN_L   = 52;
const MARGIN_R   = 52;
const CONTENT_W  = PAGE_W - MARGIN_L - MARGIN_R;

// Palette (Matching natalReportPdf.ts)
interface Theme {
  BG: string;
  BG_CARD: string;
  BG_ALT: string;
  BG_HEADER: string;
  GOLD: string;
  GOLD_DIM: string;
  IVORY: string;
  IVORY_DIM: string;
  DIVIDER: string;
  STARS: boolean;
  BORDER: boolean;
}

const FREE_THEME: Theme = {
  BG: "#FFFFFF",
  BG_CARD: "#F9F9F9",
  BG_ALT: "#F2F2F2",
  BG_HEADER: "#E0E0E0",
  GOLD: "#000000",
  GOLD_DIM: "#333333",
  IVORY: "#000000",
  IVORY_DIM: "#666666",
  DIVIDER: "#CCCCCC",
  STARS: false,
  BORDER: false,
};

const PREMIUM_THEME: Theme = {
  BG: "#071318",   // deep teal-black
  BG_CARD: "#0d2030",
  BG_ALT: "#0a1a28",
  BG_HEADER: "#0e2a1a",
  GOLD: "#D4A85F",
  GOLD_DIM: "#9a7840",
  IVORY: "#F2EDE3",
  IVORY_DIM: "#a89f94",
  DIVIDER: "#1e3d4a",
  STARS: true,
  BORDER: true,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fillBg(doc: PDFKit.PDFDocument, theme: Theme) {
  doc.rect(0, 0, PAGE_W, PAGE_H).fillColor(theme.BG).fill();
}

function drawStars(doc: PDFKit.PDFDocument) {
  const stars: [number, number, number][] = [
    [42,30,1],[130,18,0.7],[250,42,1.2],[390,12,0.8],[510,38,1],[590,20,0.7],
    [70,85,0.8],[180,72,1.1],[315,90,0.7],[450,68,0.9],[560,82,1],[610,95,0.7],
    [28,145,1],[140,130,0.8],[280,155,1.2],[420,140,0.7],[545,150,1],[598,138,0.8],
    [55,210,0.7],[175,220,1],[310,200,0.8],[460,215,0.9],[575,205,0.7],[605,222,1],
  ];
  stars.forEach(([sx, sy, sr]) => {
    const opacity = 0.18 + sr * 0.18;
    doc.circle(sx, sy, sr).fillColor("#ffffff").fillOpacity(opacity).fill().fillOpacity(1);
  });
}

function drawBorder(doc: PDFKit.PDFDocument, theme: Theme) {
  const inset = 12;
  doc.rect(inset, inset, PAGE_W - inset * 2, PAGE_H - inset * 2)
     .strokeColor(theme.GOLD).strokeOpacity(0.2).lineWidth(1).stroke().strokeOpacity(1);
}

function sectionTitle(doc: PDFKit.PDFDocument, theme: Theme, title: string) {
  doc.moveDown(0.65);
  const y = doc.y;
  doc.rect(MARGIN_L, y, CONTENT_W, 20).fillColor(theme.BG_HEADER).fill();
  doc.moveTo(MARGIN_L, y).lineTo(PAGE_W - MARGIN_R, y).strokeColor(theme.GOLD_DIM).strokeOpacity(0.45).lineWidth(0.7).stroke().strokeOpacity(1);
  doc.font("Times-Bold").fontSize(9).fillColor(theme.GOLD)
     .text(title.toUpperCase(), MARGIN_L + 8, y + 6, { width: CONTENT_W - 16, lineBreak: false });
  doc.y = y + 24;
}

function tableRow(
  doc: PDFKit.PDFDocument,
  theme: Theme,
  cols: string[],
  widths: number[],
  x0: number,
  y0: number,
  opts: { header?: boolean; shade?: boolean; rowH?: number }
): number {
  const ROW_H = opts.rowH ?? 18;
  const fill  = opts.header ? theme.BG_HEADER : opts.shade ? theme.BG_ALT : theme.BG_CARD;
  const color = opts.header ? theme.GOLD : theme.IVORY;

  doc.rect(x0, y0, widths.reduce((a, b) => a + b, 0), ROW_H).fillColor(fill).fill();

  let cx = x0;
  cols.forEach((text, i) => {
    doc.font(opts.header ? "Times-Bold" : "Times-Roman")
       .fontSize(opts.header ? 8 : 9)
       .fillColor(color)
       .text(text, cx + 6, y0 + 5, { width: widths[i] - 12, lineBreak: false });
    cx += widths[i];
  });
  return y0 + ROW_H;
}

function addFooter(doc: PDFKit.PDFDocument, theme: Theme, label: string, page: number) {
  const y = PAGE_H - 26;
  doc.moveTo(MARGIN_L, y - 6).lineTo(PAGE_W - MARGIN_R, y - 6)
     .strokeColor(theme.GOLD_DIM).strokeOpacity(0.25).lineWidth(0.4).stroke().strokeOpacity(1);
  doc.font("Times-Roman").fontSize(7.5).fillColor(theme.IVORY_DIM)
     .text(`Soul Codex  ·  ${label}  ·  Compatibility Report`, MARGIN_L, y, { width: CONTENT_W - 50, align: "left" })
     .text(`${page}`, PAGE_W - MARGIN_R - 20, y, { width: 20, align: "right" });
}

// ── Main builder ──────────────────────────────────────────────────────────────

export function buildCompatibilityReportPdf(input: CompatibilityReportInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 0,
      info: {
        Title: `Compatibility Report — ${input.profile1.name} & ${input.profile2.name}`,
        Author: "Soul Codex",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const theme = input.isPremium ? PREMIUM_THEME : FREE_THEME;
    const { profile1, profile2, compatibilityData, aiText } = input;
    let pageNum = 1;

    // ══════════════════════════════════════════════════════════════════════════
    // COVER PAGE
    // ══════════════════════════════════════════════════════════════════════════
    fillBg(doc, theme);
    if (theme.STARS) drawStars(doc);
    if (theme.BORDER) drawBorder(doc, theme);

    // Top gold rule
    doc.moveTo(MARGIN_L, 52).lineTo(PAGE_W - MARGIN_R, 52)
       .strokeColor(theme.GOLD).strokeOpacity(0.55).lineWidth(0.8).stroke().strokeOpacity(1);

    doc.font("Times-Bold").fontSize(9).fillColor(theme.GOLD)
       .text("S O U L   C O D E X", 0, 60, { width: PAGE_W, align: "center", characterSpacing: 2 });

    const centerY = 240;
    doc.font("Times-Bold").fontSize(28).fillColor(theme.IVORY)
       .text(profile1.name, 0, centerY, { width: PAGE_W, align: "center" });
    
    doc.moveDown(0.3);
    doc.font("Times-Roman").fontSize(18).fillColor(theme.GOLD)
       .text("&", 0, doc.y, { width: PAGE_W, align: "center" });

    doc.moveDown(0.3);
    doc.font("Times-Bold").fontSize(28).fillColor(theme.IVORY)
       .text(profile2.name, 0, doc.y, { width: PAGE_W, align: "center" });

    doc.moveDown(1);
    doc.font("Times-Roman").fontSize(11).fillColor(theme.GOLD)
       .text("COMPATIBILITY ANALYSIS", 0, doc.y, { width: PAGE_W, align: "center", characterSpacing: 1.5 });

    // Overall score callout
    const scoreY = 480;
    doc.rect(PAGE_W / 2 - 60, scoreY, 120, 120).fillColor(theme.BG_CARD).fill();
    doc.font("Times-Roman").fontSize(8).fillColor(theme.IVORY_DIM)
       .text("OVERALL SCORE", PAGE_W / 2 - 60, scoreY + 25, { width: 120, align: "center", characterSpacing: 2 });
    doc.font("Times-Bold").fontSize(42).fillColor(theme.GOLD)
       .text(`${compatibilityData.overallScore ?? 0}`, PAGE_W / 2 - 60, scoreY + 45, { width: 120, align: "center" });

    addFooter(doc, theme, `${profile1.name} & ${profile2.name}`, pageNum);

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 2 — Analysis
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage({ margin: 0 }); pageNum++;
    fillBg(doc, theme); if (theme.STARS) drawStars(doc); if (theme.BORDER) drawBorder(doc, theme);

    sectionTitle(doc, theme, "Compatibility Scores");
    const scoreCols = [200, CONTENT_W - 200];
    let ty = doc.y;
    ty = tableRow(doc, theme, ["Category", "Score"], scoreCols, MARGIN_L, ty, { header: true });

    const scoreRows = [
      ["Astrology", `${compatibilityData.categories?.astrology?.score ?? 0}`],
      ["Numerology", `${compatibilityData.categories?.numerology?.score ?? 0}`],
      ["Human Design", `${compatibilityData.categories?.humanDesign?.score ?? 0}`],
      ["Personality", `${compatibilityData.categories?.personality?.score ?? 0}`],
      ["Moral Compass", `${compatibilityData.categories?.moralCompass?.score ?? 0}`],
    ];
    scoreRows.forEach(([cat, val], i) => {
      ty = tableRow(doc, theme, [cat, val], scoreCols, MARGIN_L, ty, { shade: i % 2 === 1 });
    });

    if (aiText?.overview) {
      doc.y = ty + 20;
      sectionTitle(doc, theme, "The Synthesis");
      doc.font("Times-Roman").fontSize(10).fillColor(theme.IVORY)
         .text(aiText.overview, MARGIN_L, doc.y, { width: CONTENT_W, lineGap: 3 });
    }

    if (aiText?.strengths?.length) {
      doc.moveDown(1);
      sectionTitle(doc, theme, "Shared Strengths");
      aiText.strengths.forEach(s => {
        doc.font("Times-Roman").fontSize(9.5).fillColor(theme.IVORY)
           .text(`◈ ${s}`, MARGIN_L + 10, doc.y, { width: CONTENT_W - 10, lineGap: 2 });
      });
    }

    addFooter(doc, theme, `${profile1.name} & ${profile2.name}`, pageNum);

    doc.end();
  });
}
