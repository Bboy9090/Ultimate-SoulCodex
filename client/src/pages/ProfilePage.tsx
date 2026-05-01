import React, { useState, useEffect, useRef, ReactNode } from "react";

import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, apiFetch } from "../lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import CosmicLoader from "@/components/CosmicLoader";
import ScButton from "@/components/ScButton";
import AppleSignInButton from "@/components/AppleSignInButton";
import { 
  IconStar, IconProfile, IconGuide, IconTracker, 
  IconTimeline, IconCodex, IconCompat, IconBlueprint, 
  IconMoon, IconIdentity, IconSparkles, IconChevronDown,
  IconReading, IconMail, IconArrowRight, IconChevronRight,
  IconZodiacAries, IconZodiacTaurus, IconZodiacGemini, 
  IconZodiacCancer, IconZodiacLeo, IconZodiacVirgo, 
  IconZodiacLibra, IconZodiacScorpio, IconZodiacSagittarius, 
  IconZodiacCapricorn, IconZodiacAquarius, IconZodiacPisces,
  IconLogo
} from "../components/Icons";

interface Archetype {
  name: string;
  tagline: string;
  element: string;
  role: string;
}

interface Synthesis {
  coreEssence: string;
  stressPattern: string;
  relationshipPattern: string;
  moralCode: { name: string; notes: string };
  powerMode: string;
  growthEdges: string[];
}

interface HumanDesignData {
  type?: string;
  authority?: string;
  profile?: string;
}

interface SoulComparable {
  name: string;
  why: string;
}

interface SoulComparables {
  animal: SoulComparable;
  deity: SoulComparable;
  historical: SoulComparable;
  icon: SoulComparable;
}

const COMPARABLES_CONFIG = [
  { key: "animal" as const,     label: "Spirit Animal",      glyph: IconGuide as React.ComponentType<any>, accent: "#22c55e" },
  { key: "deity" as const,      label: "Mythic Deity",       glyph: IconStar as React.ComponentType<any>, accent: "#f59e0b" },
  { key: "historical" as const, label: "Historical Figure",  glyph: IconCodex as React.ComponentType<any>, accent: "#22d3ee" },
  { key: "icon" as const,       label: "Cultural Icon",      glyph: IconStar as React.ComponentType<any>,  accent: "#f472b6" },
];

function comparablesCacheKey(profile: SoulProfile): string {
  const sig = `${profile.archetype?.name ?? ""}:${profile.sunSign ?? ""}:${profile.lifePath ?? ""}`;
  return `soulComparables:${sig}`;
}

function loadCachedComparables(profile: SoulProfile): SoulComparables | null {
  try {
    const raw = localStorage.getItem(comparablesCacheKey(profile));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveComparablesCache(profile: SoulProfile, data: SoulComparables) {
  try { localStorage.setItem(comparablesCacheKey(profile), JSON.stringify(data)); } catch {}
}

interface SoulProfile {
  id?: string;
  profileId?: string;
  archetype: Archetype;
  synthesis: Synthesis;
  name?: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  lifePath?: number;
  humanDesignData?: HumanDesignData;
  astrologyData?: Record<string, unknown>;
  rawInput?: {
    birthDate?: string;
    birthTime?: string;
    birthLocation?: string;
    name?: string;
  };
}

interface ConfidenceData {
  badge: "verified" | "partial" | "unverified";
  label: string;
  reason: string;
}

async function getProfile(): Promise<SoulProfile | null> {
  try {
    const raw = localStorage.getItem("soulProfile");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.archetype && data?.synthesis) return data as SoulProfile;
    const res = await apiFetch("/api/profiles");
    if (res.ok) {
      const serverProfile = await res.json();
      const fetched = Array.isArray(serverProfile) ? serverProfile[0] : serverProfile;
      if (fetched?.archetype && fetched?.synthesis) {
        localStorage.setItem("soulProfile", JSON.stringify(fetched));
        return fetched as SoulProfile;
      }
    }
    return null;
  } catch { return null; }
}

function getConfidence(): ConfidenceData | null {
  try {
    const raw = localStorage.getItem("soulConfidence");
    if (raw) return JSON.parse(raw) as ConfidenceData;
    const profile = localStorage.getItem("soulProfile");
    if (profile) {
      const p = JSON.parse(profile);
      if (p.confidence) return p.confidence as ConfidenceData;
    }
    return null;
  } catch { return null; }
}

function getCodexPrescription(index = 0): string | null {
  try {
    const raw = localStorage.getItem("soulCodexReading");
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d?.prescriptions?.[index] ?? null;
  } catch { return null; }
}

// ── Text helpers ─────────────────────────────────────────────────────────────

/** Returns the first complete sentence of a text block. */
function firstSentence(text: string): string {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return "";
  const s = trimmed.split(/(?<=[.!?])\s/)[0];
  return s.endsWith(".") || s.endsWith("!") || s.endsWith("?") ? s : s + ".";
}

/**
 * Returns the text with the first sentence removed — so the deep section
 * doesn't repeat what was already shown in the snapshot card above.
 * Falls back to the full text when it's a single sentence.
 */
function afterFirstSentence(text: string): string {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/(?<=[.!?])\s+/);
  if (parts.length <= 1) return trimmed;
  return parts.slice(1).join(" ");
}

/**
 * Strips old-format interpolation patterns from cached synthesis data.
 * Removes zodiac-injection sentences, label prefixes, and formula prose
 * that was generated by earlier versions of the synthesis engine.
 */
const ZODIAC_PAT = "Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces";
function stripLegacyPatterns(text: string): string {
  if (!text) return text;
  // "I lead with my [Sign] [words]." whole sentences
  text = text.replace(new RegExp(`I lead with my (?:${ZODIAC_PAT})[^.!?]*[.!?]\\s*`, "gi"), "");
  // "My [Sign] [nature/sun/moon/rising] [words]." whole sentences
  text = text.replace(new RegExp(`My (?:${ZODIAC_PAT}) (?:nature|sun|moon|rising)[^.!?]*[.!?]\\s*`, "gi"), "");
  // "My life path (N) shapes how I build..." old formula
  text = text.replace(/My life path \(\d+\) shapes how I build[^.!?]*[.!?]\s*/gi, "");
  // "and my energy style is X." tail
  text = text.replace(/(?:and )?my energy style is \w+[^.!?]*[.!?]\s*/gi, "");
  // "My default pressure response: " and "Under stress: " label prefixes
  text = text.replace(/^(?:My default pressure response|Under stress):\s*/i, "");
  return text.trim();
}

/**
 * Strips zodiac-sign-first openers so behavioral observations lead.
 * "As a Scorpio, I tend to…" → "I tend to…"
 */
const ZODIAC = "Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces";
const SIGN_OPENER = new RegExp(
  `^(?:As (?:a |an )?(?:Sun |Moon |Rising )?(${ZODIAC})|My (${ZODIAC}) (?:Sun|Moon|Rising|nature)|I lead with my (${ZODIAC})(?:\\s+(?:Sun|Moon|Rising))?)[^,]*,\\s*`,
  "i"
);

function cleanBehavioralText(text: string): string {
  if (!text) return text;
  const match = text.match(SIGN_OPENER);
  if (match) {
    const rest = text.slice(match[0].length);
    return rest.charAt(0).toUpperCase() + rest.slice(1);
  }
  return text;
}

// ── Section visual config ────────────────────────────────────────────────────
const SECTION_STYLES: Record<string, { glyph: any; accent: string; bg: string }> = {
  who:      { glyph: IconProfile, accent: "#D4A85F", bg: "rgba(28, 22, 53, 0.72)" },
  stress:   { glyph: IconGuide, accent: "#f59e0b", bg: "rgba(28, 22, 53, 0.72)" },
  relate:   { glyph: IconCompat, accent: "#f472b6", bg: "rgba(28, 22, 53, 0.72)" },
  compass:  { glyph: IconBlueprint, accent: "#22d3ee", bg: "rgba(28, 22, 53, 0.72)" },
  build:    { glyph: IconCodex, accent: "#fbbf24", bg: "rgba(28, 22, 53, 0.72)" },
  growth:   { glyph: IconTracker, accent: "#22c55e", bg: "rgba(28, 22, 53, 0.72)" },
  account:  { glyph: IconBlueprint, accent: "#8a7553", bg: "rgba(28, 22, 53, 0.72)" },
  legal:    { glyph: IconBlueprint, accent: "#D4A85F", bg: "rgba(212,168,95,0.03)" },
};

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { data: user } = useQuery<any>({ queryKey: ["/api/user"] });
  const [profile, setProfile] = useState<SoulProfile | null>(null);
  const confidence   = getConfidence();
  const prescription  = getCodexPrescription(0);
  const prescription2 = getCodexPrescription(1);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [comparables, setComparables]             = useState<SoulComparables | null>(null);
  const [comparablesLoading, setComparablesLoading] = useState(false);
  const [comparablesRevealed, setComparablesRevealed] = useState(false);
  const [isPremium, setIsPremium]                 = useState(false);
  const [premiumChecked, setPremiumChecked]        = useState(false);
  const [accessCode, setAccessCode]               = useState("");
  const [codeSubmitting, setCodeSubmitting]        = useState(false);
  const [codeMessage, setCodeMessage]             = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [email, setEmail]                         = useState("");
  const [emailSubmitting, setEmailSubmitting]     = useState(false);
  const [emailMessage, setEmailMessage]           = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [emailSaved, setEmailSaved]               = useState(() => {
    try { return !!localStorage.getItem("soulEmailSaved"); } catch { return false; }
  });

  const preComputeTriggered = useRef(false);


  useEffect(() => {
    (async () => {
      // Safety Timeout: If server takes too long, just show what we have locally
      const safetyTimer = setTimeout(() => {
        setPremiumChecked(true);
        // If profile is still null after 10s, try one last local check
        if (!profile) {
          try {
            const raw = localStorage.getItem("soulProfile");
            if (raw) {
              const data = JSON.parse(raw);
              if (data?.archetype) setProfile(data);
            }
          } catch {}
        }
      }, 10000);

      const nextProfile = await getProfile();
      setProfile(nextProfile);
      if (nextProfile) {
        const cached = loadCachedComparables(nextProfile);
        if (cached) { setComparables(cached); setComparablesRevealed(true); }
      }

      const cachedPremium = (() => { try { return localStorage.getItem("soulPremium") === "true"; } catch { return false; } })();
      if (cachedPremium) setIsPremium(true);

      apiFetch("/api/entitlements")
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => {
          if (d?.isPremium) {
            setIsPremium(true);
            try { localStorage.setItem("soulPremium", "true"); } catch {}
          }
        })
        .catch(() => {})
        .finally(() => {
          clearTimeout(safetyTimer);
          setPremiumChecked(true);
        });
    })();
  }, []);

  // Background Pre-compute for Codex removed to prevent UI thread congestion
  useEffect(() => {
    if (!profile) return;
    // We only log profile presence now, actual generation happens on /codex page
    console.log("[Profile] Active for:", profile.name);
  }, [profile]);


  async function handleRevealComparables() {
    if (!profile || comparablesLoading) return;
    if (comparables) { setComparablesRevealed(r => !r); return; }
    setComparablesLoading(true);
    try {
      const res = await apiFetch("/api/soul-comparables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (res.ok) {
        const { comparables: data } = await res.json();
        setComparables(data);
        setComparablesRevealed(true);
        saveComparablesCache(profile, data);
      }
    } catch (e) {
      console.error("[SoulComparables]", e);
    } finally {
      setComparablesLoading(false);
    }
  }

  async function handleSaveEmail() {
    if (!email.trim() || !email.includes("@")) return;
    setEmailSubmitting(true);
    setEmailMessage(null);
    try {
      const res = await apiFetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), profileId: profile?.id || profile?.profileId })
      });
      if (!res.ok) throw new Error("Failed to save email");
      localStorage.setItem("soulEmailSaved", "true");
      setEmailSaved(true);
      setEmailMessage({ type: "success", text: "Blueprint saved. We'll alert you of major transits." });
    } catch (err) {
      setEmailMessage({ type: "error", text: "Failed to save. Try again." });
    } finally {
      setEmailSubmitting(false);
    }
  }

  async function handleDownloadReport() {
    if (!profile || downloadingReport) return;
    setDownloadingReport(true);
    try {
      const displayName = profile.name ?? profile.rawInput?.name ?? profile.archetype?.name ?? "User";
      const res = await apiFetch("/api/natal-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            name: displayName,
            birthDate: profile.birthDate ?? profile.rawInput?.birthDate ?? "",
            birthTime: profile.birthTime ?? profile.rawInput?.birthTime ?? "",
            birthLocation: profile.birthLocation ?? profile.rawInput?.birthLocation ?? "",
          },
          astrologyData: profile.astrologyData ?? null,
          humanDesignData: profile.humanDesignData ?? null,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Report generation failed: ${msg}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = displayName.replace(/[^a-zA-Z0-9]/g, "_");
      a.download = `${safeName}_Natal_Chart_and_Human_Design.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 2000);
    } catch (e) {
      console.error("[DownloadReport]", e);
    } finally {
      setDownloadingReport(false);
    }
  }

  async function handleAccessCode() {
    if (!profile || codeSubmitting || !accessCode.trim()) return;
    let pid = profile.id ?? profile.profileId;
    if (!pid) {
      try {
        const profileRes = await apiFetch("/api/profiles");
        if (profileRes.ok) {
          const serverProfile = await profileRes.json();
          const fetched = Array.isArray(serverProfile) ? serverProfile[0] : serverProfile;
          pid = fetched?.id ?? fetched?.profileId;
        }
      } catch {}
    }
    if (!pid) {
      setCodeMessage({ type: "error", text: "Profile ID not found. Try rebuilding your profile." });
      return;
    }
    setCodeSubmitting(true);
    setCodeMessage(null);
    try {
      const res = await apiFetch("/api/access-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: accessCode.trim(), profileId: pid }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsPremium(true);
        try { localStorage.setItem("soulPremium", "true"); } catch {}
        setCodeMessage({ type: "success", text: "Premium access activated. All features are now unlocked." });
        setAccessCode("");
      } else {
        setCodeMessage({ type: "error", text: data.message || "Invalid code. Check the code and try again." });
      }
    } catch {
      setCodeMessage({ type: "error", text: "Connection error. Check your internet and try again." });
    } finally {
      setCodeSubmitting(false);
    }
  }

  if (!premiumChecked) {
    return <CosmicLoader fullPage label="Validating Entitlements" />;
  }

  if (!profile) {
    return (
      <div style={{ padding: "4rem 1rem", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
          <IconIdentity size={72} style={{ marginBottom: "1.25rem", color: "var(--sc-gold)" }} />
        <h2 className="gradient-text" style={{ marginBottom: "0.75rem" }}>No profile found</h2>
        <p style={{ marginBottom: "2rem", color: "var(--muted-foreground)", lineHeight: 1.65, fontSize: "0.9rem" }}>
          Complete the onboarding to generate your soul profile.
        </p>
        <ScButton
          onClick={() => navigate("/start")}
          size="lg"
          className="min-w-[200px]"
        >
          <IconIdentity size={18} /> Begin Your Reading
        </ScButton>
      </div>
    );
  }

  const { archetype, synthesis } = profile;

  // Strip legacy interpolation patterns from cached synthesis data
  const cleanPattern = stripLegacyPatterns((synthesis as any).myPattern ?? (synthesis as any).coreEssence ?? "");
  const cleanStress  = stripLegacyPatterns(synthesis.stressPattern ?? "");

  const whyNowValue = prescription
    ? prescription
    : synthesis.growthEdges?.[0] ?? "";

  const oneMoveValue = prescription2
    ? prescription2
    : synthesis.growthEdges?.[1] ?? synthesis.growthEdges?.[0] ?? "";

  const snapshotCards = [
    {
      label: "My Pattern",
      value: cleanPattern,
      accent: "var(--sc-gold)", // Cosmic Gold
      bg: "rgba(212, 168, 95, 0.08)",
      featured: true,
    },
    {
      label: "What's Alive Now",
      value: whyNowValue,
      accent: "#FF007F", // Neon Rose
      bg: "rgba(26, 11, 46, 0.8)",
    },
    {
      label: "One Pattern to Watch",
      value: firstSentence(cleanStress),
      accent: "#F2C94C", // Cosmic Gold
      bg: "rgba(26, 11, 46, 0.8)",
    },
    {
      label: "One Move Today",
      value: oneMoveValue,
      accent: "#22d3ee", // Cosmic Cyan
      bg: "rgba(26, 11, 46, 0.8)",
    },
  ];

  // Deep-section text: strip the first sentence already shown in snapshot
  const myPatternDeep = cleanBehavioralText(afterFirstSentence(cleanPattern) || cleanPattern);
  const stressDeep    = cleanBehavioralText(afterFirstSentence(cleanStress) || cleanStress);
  const relateDeep    = cleanBehavioralText(synthesis.relationshipPattern ?? "");
  const buildDeep     = cleanBehavioralText(synthesis.powerMode ?? "");
  const compassNotes  = cleanBehavioralText(synthesis.moralCode?.notes ?? "");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ padding: "2rem 1rem 5rem", maxWidth: 720, margin: "0 auto", position: "relative", overflow: "hidden" }}
    >

      {/* ── Atmospheric background watermark ─────────────────────────────── */}
      <div
        style={{
          position: "absolute", top: "-40px", left: "50%",
          transform: "translateX(-50%)",
          width: 480, height: 480,
          opacity: 0.055,
          mixBlendMode: "screen",
          filter: "blur(22px)",
          pointerEvents: "none", userSelect: "none", zIndex: 0,
        }}
      >
        <IconLogo size={480} />
      </div>

      {/* ── Identity header ─────────────────────────────────────────────── */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: "center", marginBottom: "2.5rem", position: "relative", zIndex: 1 }}
      >

        <div style={{
          fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase",
          color: "var(--sc-stone)", marginBottom: "1.25rem", fontWeight: 700,
          fontFamily: "var(--font-display)"
        }}>
          My Identity
        </div>

        {/* New SVG logo mark above archetype name */}
        <motion.div 
          whileHover={{ rotate: 10, scale: 1.1 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: "0.85rem", cursor: "pointer" }}
        >
          <IconLogo
            size={72}
            style={{
              filter: "drop-shadow(0 0 14px rgba(212,168,95,0.45))",
              opacity: 0.95,
            }}
          />
        </motion.div>
        
        <div style={{
          fontSize: "0.75rem", 
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--sc-gold)", fontWeight: 800, marginBottom: "0.5rem",
          fontFamily: "var(--font-display)",
          opacity: 0.9
        }}>
          1. My Identity
        </div>

        <h1
          className="gradient-text text-glow"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem, 9vw, 4.5rem)",
            letterSpacing: "-0.03em",
            fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem",
            textShadow: "0 0 60px rgba(157,78,221,0.6)"
          }}
        >
          {archetype.name}
        </h1>

        <div style={{
          display: "flex", gap: "0.5rem", justifyContent: "center",
          flexWrap: "wrap", marginBottom: "0.85rem",
        }}>
          {(archetype.element?.toLowerCase().includes("unknown") || archetype.role?.toLowerCase().includes("unknown")) ? null : (
            <span style={{
              display: "inline-block", padding: "0.4rem 1.2rem",
              background: "rgba(26, 11, 46, 0.8)", border: "1px solid rgba(157,78,221,0.5)",
              borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700,
              color: "#E0CCFF", letterSpacing: "0.15em", textTransform: "uppercase",
              boxShadow: "0 0 20px rgba(157,78,221,0.2)"
            }}>
              {archetype.element} · {archetype.role}
            </span>
          )}
          {confidence && (
            <ConfidenceBadge
              badge={confidence.badge}
              label={confidence.label}
              reason={confidence.reason}
              size="sm"
            />
          )}
        </div>

        <p style={{
          fontSize: "clamp(1rem, 3vw, 1.25rem)",
          color: "rgba(234, 234, 245, 0.9)", fontStyle: "italic",
          fontFamily: "var(--font-oracle)",
          maxWidth: 520, margin: "0 auto",
          lineHeight: 1.6
        }}>
          {archetype.tagline}
        </p>

        <div style={{
          marginTop: "2rem",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(212,168,95,0.3), transparent)",
        }} />
      </motion.section>

      {/* ── Natal Blueprint row ─────────────────────────────────────────── */}
      <NatalBlueprint profile={profile} />

      {/* ── Section Flow ────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem", marginBottom: "2.5rem",
        position: "relative", zIndex: 1,
      }}>
        {snapshotCards.map((card, idx) => {
          if (!card.value || card.value.toLowerCase().includes("unknown")) {
            return null; // Suppression Mode: Hide incomplete cards
          }
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              style={{
                background: card.bg,
                borderRadius: "16px",
                padding: "2rem",
                border: `1px solid ${card.accent}30`,
                borderTop: `3px solid ${card.accent}`,
                boxShadow: `0 8px 40px rgba(0,0,0,0.6), inset 0 0 30px ${card.accent}08`,
                display: "flex", flexDirection: "column",
                backdropFilter: "blur(16px)",
                textAlign: "left",
              }}
            >
              <div style={{
                fontSize: "0.75rem", 
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: card.accent, fontWeight: 800, marginBottom: "1rem",
                fontFamily: "var(--font-display)",
                opacity: 0.9
              }}>
                {idx + 2}. {card.label}
              </div>
              <p style={{
                fontSize: "1.1rem", 
                color: "var(--sc-ivory)",
                lineHeight: 1.6, margin: 0, 
                fontWeight: 400,
                fontFamily: "var(--font-serif)",
              }}>
                {card.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ── Action buttons ───────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          display: "flex", gap: "1rem", flexWrap: "wrap",
          justifyContent: "center", marginBottom: "3rem",
          position: "relative", zIndex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", flex: "1 1 200px" }}>
          <ScButton
            onClick={() => navigate("/today")}
            className="w-full text-glow"
          >
            <IconMoon size={18} /> Today's Card
          </ScButton>
          <span style={{ fontSize: "0.7rem", color: "rgba(246,241,232,0.55)", textAlign: "center" }}>
            Daily guidance & focus
          </span>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", flex: "1 1 200px" }}>
          <ScButton
            variant="secondary"
            onClick={() => navigate("/codex")}
            className="w-full"
          >
            <IconSparkles size={18} /> Open Codex Reading
          </ScButton>
          <span style={{ fontSize: "0.7rem", color: "rgba(246,241,232,0.55)", textAlign: "center" }}>
            Deep soul architecture
          </span>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", flex: "1 1 200px" }}>
          <ScButton
            variant="secondary"
            onClick={handleDownloadReport}
            loading={downloadingReport}
            className="w-full"
          >
            <IconChevronDown size={18} /> Chart Report PDF
          </ScButton>
          <span style={{ fontSize: "0.7rem", color: "rgba(246,241,232,0.55)", textAlign: "center" }}>
            Natal + Human Design
          </span>
        </div>
      </motion.div>

      {/* ── Soul Comparables ─────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: "2rem" }}>
        {/* Trigger button */}
        <button
          onClick={handleRevealComparables}
          disabled={comparablesLoading}
          style={{
            width: "100%",
            background: "rgba(28, 22, 53, 0.72)",
            border: "1px solid rgba(212,168,95,0.45)",
            borderRadius: 12,
            padding: "1rem 1.5rem",
            cursor: comparablesLoading ? "wait" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            color: "var(--sc-gold)",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <IconCodex size={24} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Soul Comparables
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(234,234,245,0.7)", marginTop: "0.15rem" }}>
                Your archetype's closest matches across animal, deity, history &amp; culture
              </div>
            </div>
          </div>
            <IconChevronDown size={16} style={{ opacity: 0.6, transform: comparablesRevealed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {/* Comparables grid */}
        {comparablesRevealed && comparables && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "0.75rem",
            marginTop: "0.75rem",
            animation: "fadeIn 0.35s ease",
          }}>
            {COMPARABLES_CONFIG.map(cfg => {
              const item = comparables[cfg.key];
              if (!item) return null;
              const Glyph = cfg.glyph;
              return (
                <div
                  key={cfg.key}
                  style={{
                    background: "rgba(28, 22, 53, 0.72)",
                    border: `1px solid ${cfg.accent}45`,
                    borderLeft: `3px solid ${cfg.accent}`,
                    borderRadius: 10,
                    padding: "1.1rem 1.25rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.55rem" }}>
                    <span style={{ fontSize: "0.95rem", color: cfg.accent }}><Glyph size={14} /></span>
                    <span style={{
                      fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase",
                      color: cfg.accent, fontWeight: 700, opacity: 0.85,
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{
                    fontSize: "0.95rem", fontWeight: 700, color: "#EAEAF5",
                    marginBottom: "0.4rem", fontFamily: "var(--font-serif)",
                  }}>
                    {item.name}
                  </div>
                  <p style={{
                    fontSize: "0.8rem", color: "rgba(234,234,245,0.85)",
                    lineHeight: 1.55, margin: 0,
                  }}>
                    {item.why}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Regenerate link */}
        {comparablesRevealed && comparables && (
          <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
            <button
              onClick={() => {
                if (!profile) return;
                try { localStorage.removeItem(comparablesCacheKey(profile)); } catch {}
                setComparables(null);
                setComparablesRevealed(false);
              }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.68rem", color: "var(--sc-gold)",
                textDecoration: "underline", textUnderlineOffset: "2px", padding: 0,
              }}
            >
              Re-roll comparables
            </button>
          </div>
        )}
      </div>

      {/* ── Email Capture ──────────────────────────────────────────────── */}
      {!isPremium && !emailSaved && premiumChecked && (
        <div style={{
          background: "rgba(28, 22, 53, 0.72)",
          border: "1px solid rgba(212,168,95,0.35)",
          borderRadius: "12px", padding: "1.5rem", marginBottom: "1.75rem",
          position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <IconIdentity size={18} style={{ color: "var(--sc-gold)", opacity: 0.7 }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(234,234,245,0.7)" }}>
              Save Your Blueprint
            </span>
          </div>
          <p style={{ fontSize: "0.82rem", color: "rgba(234,234,245,0.7)", lineHeight: 1.6, margin: "0 0 1rem" }}>
            Your free profile is currently stored locally. Enter your email to back up your archetype and get notified when major cosmic transits hit your pattern.
          </p>
          <form
            onSubmit={e => { e.preventDefault(); handleSaveEmail(); }}
            style={{ display: "flex", gap: "0.6rem", marginBottom: emailMessage ? "0.75rem" : 0 }}
          >
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
              style={{
                flex: 1, padding: "0.65rem 0.9rem",
                background: "rgba(13,11,26,0.6)", border: "1px solid rgba(212,168,95,0.35)",
                borderRadius: "8px", fontSize: "0.88rem", color: "#EAEAF5", outline: "none",
              }}
            />
            <button
              type="submit" disabled={!email.trim() || emailSubmitting}
              style={{
                padding: "0.65rem 1.25rem", fontSize: "0.82rem", fontWeight: 700,
                background: email.trim() ? "linear-gradient(135deg, #D4A85F 0%, #b8883a 100%)" : "rgba(212,168,95,0.2)",
                color: email.trim() ? "#EAEAF5" : "var(--sc-gold)",
                border: "1px solid rgba(212,168,95,0.5)", borderRadius: "8px",
                cursor: email.trim() ? "pointer" : "default", opacity: emailSubmitting ? 0.6 : 1
              }}
            >
              {emailSubmitting ? "..." : "Save"}
            </button>
          </form>
          {emailMessage && (
            <div style={{ fontSize: "0.75rem", color: emailMessage.type === "success" ? "#22c55e" : "#ef4444" }}>
              {emailMessage.text}
            </div>
          )}
        </div>
      )}

      {/* ── Access & Premium ──────────────────────────────────────────── */}
      {premiumChecked && (
        <div style={{
          background: isPremium ? "rgba(34,197,94,0.06)" : "rgba(28, 22, 53, 0.72)",
          border: `1px solid ${isPremium ? "rgba(34,197,94,0.25)" : "rgba(212,168,95,0.35)"}`,
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.75rem",
          position: "relative", zIndex: 1,
        }}>
          {isPremium ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem", flexShrink: 0,
              }}><IconSparkles size={20} style={{ color: "#22c55e" }} /></div>
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#22c55e", marginBottom: "0.15rem" }}>
                  Premium Active
                </div>
                <div style={{ fontSize: "0.78rem", color: "#3a7a3a" }}>
                  All features unlocked — Blueprint, full Codex, unlimited Soul Guide, premium chart.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <IconSparkles size={18} style={{ color: "var(--sc-gold, #D4A85F)", opacity: 0.7 }} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(234,234,245,0.7)" }}>
                  Unlock Full Access
                </span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "rgba(234,234,245,0.7)", lineHeight: 1.6, margin: "0 0 1rem" }}>
                <Link href="/pricing" style={{ color: "var(--sc-gold)", fontWeight: 700, textDecoration: "underline" }}>Upgrade here</Link> or enter an access code to unlock your Full Cosmic Blueprint, unlimited Soul Guide, premium birth chart, and the complete Codex reading.
              </p>
              <form
                onSubmit={e => { e.preventDefault(); handleAccessCode(); }}
                style={{ display: "flex", gap: "0.6rem", marginBottom: codeMessage ? "0.75rem" : 0 }}
              >
                <input
                  type="text"
                  value={accessCode}
                  onChange={e => setAccessCode(e.target.value)}
                  placeholder="Enter access code"
                  style={{
                    flex: 1, padding: "0.65rem 0.9rem",
                    background: "rgba(13,11,26,0.6)", border: "1px solid rgba(212,168,95,0.35)",
                    borderRadius: "8px", fontSize: "0.88rem",
                    color: "#EAEAF5", outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={!accessCode.trim() || codeSubmitting}
                  style={{
                    padding: "0.65rem 1.25rem",
                    background: accessCode.trim() ? "linear-gradient(135deg, #D4A85F 0%, #b8883a 100%)" : "rgba(212,168,95,0.2)",
                    border: "1px solid rgba(212,168,95,0.5)",
                    borderRadius: "8px", fontSize: "0.82rem",
                    color: accessCode.trim() ? "#EAEAF5" : "var(--sc-gold)",
                    fontWeight: 700, cursor: accessCode.trim() ? "pointer" : "default",
                    opacity: codeSubmitting ? 0.6 : 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {codeSubmitting ? "Checking…" : "Redeem"}
                </button>
              </form>
              {codeMessage && (
                <div style={{
                  fontSize: "0.8rem", lineHeight: 1.5,
                  color: codeMessage.type === "success" ? "#22c55e" : "#ef4444",
                  padding: "0.5rem 0.75rem",
                  background: codeMessage.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                  border: `1px solid ${codeMessage.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                  borderRadius: "6px",
                }}>
                  {codeMessage.text}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Full Reading divider ──────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "1rem",
        marginBottom: "1.75rem", position: "relative", zIndex: 1,
      }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(212,168,95,0.18))" }} />
        <span style={{
          fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--muted-foreground)", opacity: 0.45, whiteSpace: "nowrap",
        }}>
          Full Reading
        </span>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(212,168,95,0.18), transparent)" }} />
      </div>

      {/* ── Deep sections ────────────────────────────────────────────────── */}
      <div className="stagger" style={{ position: "relative", zIndex: 1 }}>

        <ProfileSection sectionKey="who" title="My Pattern">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.875rem" }}>
            {myPatternDeep}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="stress" title="How I React Under Stress">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.875rem" }}>
            {stressDeep}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="relate" title="How I Connect and Relate">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.875rem" }}>
            {relateDeep}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="compass" title="Moral Compass">
          <div style={{ marginBottom: "0.75rem" }}>
            <span style={{
              display: "inline-block", padding: "0.2rem 0.7rem",
              background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)",
              borderRadius: 9999, fontSize: "0.78rem", fontWeight: 600,
              color: "var(--cosmic-cyan)",
            }}>
              {synthesis.moralCode.name}
            </span>
          </div>
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.875rem" }}>
            {compassNotes}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="build" title="What I'm Built to Build">
          <p style={{ color: "var(--card-foreground)", lineHeight: 1.8, fontSize: "0.875rem" }}>
            {buildDeep}
          </p>
        </ProfileSection>

        <ProfileSection sectionKey="growth" title="Growth Edges">
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {synthesis.growthEdges.map((edge, i) => (
              <li
                key={i}
                style={{
                  display: "flex", gap: "0.75rem", alignItems: "flex-start",
                  padding: "0.7rem 0.9rem",
                  background: "rgba(34,197,94,0.07)",
                  border: "1px solid rgba(34,197,94,0.15)",
                  borderRadius: "8px",
                }}
              >
                <IconArrowRight size={14} style={{ color: "#22c55e", flexShrink: 0, marginTop: "0.1rem" }} />
                <span style={{ color: "var(--card-foreground)", lineHeight: 1.6, fontSize: "0.875rem" }}>
                  {edge}
                </span>
              </li>
            ))}
          </ul>
        </ProfileSection>

        <AccountSettings user={user} />

      </div>

    </motion.div>
  );
}

// ── Account settings (logout + delete) ───────────────────────────────────────

function AccountSettings({ user }: { user: any }) {
  const [, navigate] = useLocation();
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    try { 
      localStorage.removeItem("soulPremium"); 
      localStorage.removeItem("soulAdminToken");
      localStorage.removeItem("soulIsGuest"); // Clear guest state on logout
    } catch {}
    navigate("/");
  };

  const startGuestSession = () => {
    localStorage.setItem("soulIsGuest", "true");
    localStorage.removeItem("soulGuestProfile");
    navigate("/start");
    setTimeout(() => window.location.reload(), 100);
  };

  const endGuestSession = () => {
    localStorage.removeItem("soulIsGuest");
    localStorage.removeItem("soulGuestProfile");
    navigate("/");
    setTimeout(() => window.location.reload(), 100);
  };

  const isGuest = localStorage.getItem("soulIsGuest") === "true";

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      setError('Type DELETE to confirm.');
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await apiFetch("/api/auth/account", { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to delete account");
      }
      try {
        localStorage.removeItem("soulPremium");
        localStorage.removeItem("soulProfile");
      } catch {}
      navigate("/");
      setTimeout(() => window.location.reload(), 100);
    } catch (e: any) {
      setError(e?.message || "Failed to delete account");
      setDeleting(false);
    }
  };

  const ink = "var(--foreground)";
  const danger = "#ef4444";
  const canConfirm = confirmText === "DELETE" && !deleting;

  return (
    <div data-testid="account-settings">
      <ProfileSection sectionKey="account" title="Account Settings">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* ── Guest Mode Toggle ────────────────────────────────────────────── */}
          {isGuest ? (
            <ScButton 
              variant="outline" 
              onClick={endGuestSession}
              style={{ borderColor: "var(--sc-gold)", color: "var(--sc-gold)" }}
            >
              End Guest Session & Return to Owner
            </ScButton>
          ) : (
            <button 
              onClick={startGuestSession}
              style={{
                background: "rgba(212,168,95,0.05)",
                border: "1px solid rgba(212,168,95,0.2)",
                padding: "0.85rem",
                borderRadius: "var(--radius)",
                color: "var(--sc-gold)",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer"
              }}
            >
              Let a Guest Use Your System
            </button>
          )}
          {/* ── Apple Account Linking ────────────────────────────────────────── */}
          {!user ? (
            <div style={{ 
              background: "rgba(212,168,95,0.04)", 
              border: "1px dashed rgba(212,168,95,0.25)", 
              borderRadius: "var(--radius)",
              padding: "1.25rem",
              textAlign: "center",
              marginBottom: "0.5rem"
            }}>
              <h3 style={{ fontSize: "0.85rem", color: "var(--sc-gold)", marginBottom: "0.3rem", fontWeight: 600 }}>
                Secure This Reading
              </h3>
              <p style={{ fontSize: "0.72rem", color: "rgba(26,14,7,0.6)", marginBottom: "1rem", lineHeight: 1.5 }}>
                Link to Apple to preserve your Soul Codex and access it on your iOS device.
              </p>
              <AppleSignInButton 
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ["/api/user"] })}
                text="Protect with Apple" 
              />
            </div>
          ) : (
            <div style={{ 
              background: "rgba(163,230,53,0.06)", 
              border: "1px solid rgba(163,230,53,0.2)", 
              borderRadius: "var(--radius)",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.5rem"
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#a3e635", boxShadow: "0 0 8px rgba(163,230,53,0.5)" }} />
              <div>
                <p style={{ fontSize: "0.85rem", color: "var(--foreground)", margin: 0, fontWeight: 600 }}>Account Protected</p>
                <p style={{ fontSize: "0.72rem", color: "rgba(26,14,7,0.6)", margin: 0 }}>Connected via Apple Identity</p>
              </div>
            </div>
          )}

          <p style={{
            fontSize: "0.8rem", color: "rgba(26,14,7,0.7)",
            margin: "0 0 0.5rem", lineHeight: 1.55,
          }}>
            Manage your session or permanently remove your spiritual records.
          </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <ScButton
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-center"
          >
            Sign out
          </ScButton>

          {!showConfirm ? (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              style={{
                padding: "0.65rem 1rem",
                background: "transparent",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "var(--radius)",
                color: danger,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                marginTop: "0.25rem",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Delete account
            </button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{ 
                marginTop: "0.5rem", padding: "1rem", 
                background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", 
                borderRadius: "var(--radius)" 
              }}
            >
              <p style={{ fontSize: "0.75rem", color: danger, marginBottom: "0.75rem", fontWeight: 600 }}>
                This is permanent. Type DELETE to confirm.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                aria-label="Type DELETE to confirm account removal"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 6,
                  color: "var(--foreground)",
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <ScButton
                  variant="ghost"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </ScButton>
                <button
                  onClick={handleDelete}
                  disabled={!canConfirm}
                  style={{
                    flex: 1,
                    background: canConfirm ? danger : "rgba(239,68,68,0.2)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: canConfirm ? "pointer" : "not-allowed",
                  }}
                >
                  {deleting ? "Purging..." : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          )}

          {error && (
            <p style={{ color: danger, fontSize: "0.75rem", marginTop: "0.5rem", textAlign: "center" }}>
              {error}
            </p>
          )}

          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--glass-border)", textAlign: "center" }}>
            <button
              onClick={() => navigate("/admin")}
              aria-label="Administrative System Access"
              style={{
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--sc-gold)",
                opacity: 0.4,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
            >
              System Access
            </button>
          </div>
        </div>
      </div>
    </ProfileSection>

      {/* ── Legal & Support ─────────────────────────────────────────── */}
      <ProfileSection sectionKey="legal" title="Legal & Support">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link href="/privacy">
            <a style={{ 
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.85rem 1rem", background: "rgba(255,255,255,0.03)", 
              border: "1px solid var(--glass-border)", borderRadius: "var(--radius)",
              fontSize: "0.85rem", color: "var(--foreground)", textDecoration: "none"
            }}>
              <span>Privacy Policy</span>
              <IconChevronRight size={14} style={{ opacity: 0.4 }} aria-hidden="true" />
            </a>
          </Link>
          <Link href="/terms">
            <a style={{ 
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.85rem 1rem", background: "rgba(255,255,255,0.03)", 
              border: "1px solid var(--glass-border)", borderRadius: "var(--radius)",
              fontSize: "0.85rem", color: "var(--foreground)", textDecoration: "none"
            }}>
              <span>Terms of Service</span>
              <IconChevronRight size={14} style={{ opacity: 0.4 }} aria-hidden="true" />
            </a>
          </Link>
          <a href="mailto:support@soulcodex.app" style={{ 
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "0.85rem 1rem", background: "rgba(212,168,95,0.05)", 
            border: "1px solid rgba(212,168,95,0.15)", borderRadius: "var(--radius)",
            fontSize: "0.85rem", color: "var(--sc-gold)", textDecoration: "none"
          }}>
            <span>Contact Oracle Support</span>
            <IconMail size={16} style={{ opacity: 0.6 }} />
          </a>
          <p style={{ textAlign: "center", fontSize: "0.68rem", opacity: 0.3, marginTop: "0.5rem", letterSpacing: "0.05em", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <IconReading size={12} /> SOUL CODEX v1.0.0 — 2026 <IconReading size={12} />
          </p>
        </div>
      </ProfileSection>

      <div style={{ height: "4rem" }} />
    </div>
  );
}

// ── Natal Blueprint component ────────────────────────────────────────────────

const SIGN_GLYPHS: Record<string, React.ComponentType<any>> = {
  Aries: IconZodiacAries, Taurus: IconZodiacTaurus, Gemini: IconZodiacGemini, Cancer: IconZodiacCancer, 
  Leo: IconZodiacLeo, Virgo: IconZodiacVirgo, Libra: IconZodiacLibra, Scorpio: IconZodiacScorpio, 
  Sagittarius: IconZodiacSagittarius, Capricorn: IconZodiacCapricorn, Aquarius: IconZodiacAquarius, Pisces: IconZodiacPisces,
};

function NatalBlueprint({ profile }: { profile: SoulProfile }) {
  const sun     = profile.sunSign;
  const moon    = profile.moonSign;
  const rising  = profile.risingSign;
  const lp      = profile.lifePath;
  const hdType  = profile.humanDesignData?.type;
  const hdAuth  = profile.humanDesignData?.authority?.replace(" Authority", "");
  const hdProf  = profile.humanDesignData?.profile;

  const hasAny = sun || moon || rising || lp || hdType;
  if (!hasAny) return null;

  return (
    <div style={{
      marginBottom: "2rem",
      padding: "1rem 1.1rem",
      background: "rgba(212,168,95,0.04)",
      border: "1px solid rgba(212,168,95,0.1)",
      borderRadius: "12px",
      position: "relative", zIndex: 1,
    }}>
      <div style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(246,241,232,0.5)", fontWeight: 600, marginBottom: "0.75rem" }}>
        <IconReading size={12} /> My Chart
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {sun   && <BlueprintChip label="Sun"      value={sun}      glyph={SIGN_GLYPHS[sun]}   accent="#f59e0b" />}
        {moon  && <BlueprintChip label="Moon"     value={moon}     glyph={SIGN_GLYPHS[moon]}  accent="#D4A85F" />}
        {rising && <BlueprintChip label="Rising"  value={rising}   glyph={SIGN_GLYPHS[rising]} accent="#22d3ee" />}
        {lp    && <BlueprintChip label="Life Path" value={String(lp)}                             accent="#ec4899" />}
        {hdType && <BlueprintChip label="HD Type"  value={hdType}                                 accent="#22c55e" />}
        {hdAuth && <BlueprintChip label="Authority" value={hdAuth}                                accent="#fbbf24" />}
        {hdProf && <BlueprintChip label="Profile"   value={hdProf}                                accent="#a78bfa" />}
      </div>
      {(!rising || !hdType) && (
        <p style={{ fontSize: "0.68rem", color: "rgba(246,241,232,0.45)", margin: "0.65rem 0 0", lineHeight: 1.5 }}>
          {!rising && !hdType
            ? "Add birth time + location to unlock Rising sign, Human Design type & authority"
            : !rising
              ? "Add birth time to unlock Rising sign"
              : "Add birth location to unlock full Human Design"}
        </p>
      )}
    </div>
  );
}

// ── Section component ────────────────────────────────────────────────────────

const ProfileSection = React.memo(({
  sectionKey,
  title,
  children,
}: {
  sectionKey: keyof typeof SECTION_STYLES;
  title: string;
  children: ReactNode;
}) => {
  const s = SECTION_STYLES[sectionKey];
  const Glyph = s.glyph;
  return (
    <section
      style={{
        background: s.bg,
        border: `1px solid ${s.accent}45`,
        borderLeft: `3px solid ${s.accent}`,
        borderRadius: "12px",
        padding: "1.4rem 1.5rem",
        marginBottom: "1.25rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.9rem" }}>
        <span style={{ color: s.accent, fontSize: "1rem", lineHeight: 1, flexShrink: 0, display: "flex", alignItems: "center" }}>
          <Glyph size={18} />
        </span>
        <h3 style={{
          fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--foreground)", margin: 0,
        }}>
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
});

const BlueprintChip = React.memo(({ label, value, accent, glyph: Glyph }: { label: string; value: string; accent: string; glyph?: React.ComponentType<any> }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${accent}25`,
    borderRadius: "8px",
    padding: "0.6rem 0.85rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem"
  }}>
    <span style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>{label}</span>
    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
      {Glyph && <Glyph size={12} style={{ color: accent }} />} {value}
    </span>
  </div>
));
