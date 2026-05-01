import React, { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { apiFetch } from "../lib/queryClient";
import { motion } from "framer-motion";
import CosmicLoader from "../components/CosmicLoader";
import ScButton from "../components/ScButton";
import { 
  IconStar, IconProfile, IconCodex, IconCompat, 
  IconBlueprint, IconMoon, IconIdentity, IconSparkles,
  IconReading, IconZodiacAries, IconZodiacTaurus, IconZodiacGemini, 
  IconZodiacCancer, IconZodiacLeo, IconZodiacVirgo, 
  IconZodiacLibra, IconZodiacScorpio, IconZodiacSagittarius, 
  IconZodiacCapricorn, IconZodiacAquarius, IconZodiacPisces,
  IconLogo
} from "../components/Icons";

interface SharedProfileView {
  profile: any;
  sharedBy: string;
  shareDate: string;
  settings: any;
}

export default function SharePage() {
  const [, params] = useRoute("/share/:token");
  const token = params?.token;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedView, setSharedView] = useState<SharedProfileView | null>(null);
  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);

  async function fetchSharedProfile(pass?: string) {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const url = pass 
        ? `/api/share/${token}?password=${encodeURIComponent(pass)}`
        : `/api/share/${token}`;
      
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setSharedView(data);
        setPasswordRequired(false);
      } else if (res.status === 401) {
        const data = await res.json();
        if (data.requiresPassword) {
          setPasswordRequired(true);
        } else {
          setError("Invalid password");
        }
      } else if (res.status === 404) {
        setError("This shareable link has expired or doesn't exist.");
      } else {
        setError("Failed to load the shared profile.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSharedProfile();
  }, [token]);

  if (loading) return <CosmicLoader fullPage label="Aligning Celestial Data..." />;

  if (passwordRequired) {
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            background: "rgba(28, 22, 53, 0.85)", 
            padding: "2.5rem", 
            borderRadius: "20px", 
            border: "1px solid var(--sc-gold-glow)",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
            backdropFilter: "blur(20px)"
          }}
        >
          <IconBlueprint size={48} style={{ color: "var(--sc-gold)", marginBottom: "1.5rem" }} />
          <h2 className="heading-display" style={{ marginBottom: "1rem" }}>Protected Dimension</h2>
          <p style={{ color: "var(--sc-text-muted)", marginBottom: "2rem" }}>This profile is password protected.</p>
          <input 
            type="password" 
            placeholder="Enter Cosmic Key"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "1rem",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(212,168,95,0.3)",
              borderRadius: "8px",
              color: "white",
              marginBottom: "1.5rem",
              textAlign: "center"
            }}
          />
          <ScButton onClick={() => fetchSharedProfile(password)} className="w-full">
            Unlock Profile
          </ScButton>
        </motion.div>
      </div>
    );
  }

  if (error || !sharedView) {
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
        <IconCodex size={64} style={{ color: "var(--sc-gold)", marginBottom: "1rem" }} />
        <h1 className="heading-display" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Lost Coordinates</h1>
        <p style={{ color: "var(--sc-text-muted)", maxWidth: "400px", marginBottom: "2rem" }}>{error}</p>
        <Link href="/">
          <ScButton size="lg">Return to Source</ScButton>
        </Link>
      </div>
    );
  }

  const { profile, sharedBy, shareDate } = sharedView;
  const archetype = profile.archetype || profile.soulArchetype || { name: "Unknown Archetype", tagline: "Celestial entity in transition" };
  const synthesis = profile.synthesis || {};

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "4rem 1rem", maxWidth: "720px", margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "var(--sc-gold)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
          Shared by {sharedBy}
        </div>
        <h1 className="heading-display gradient-text" style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>
          {archetype.name}
        </h1>
        <p className="font-oracle" style={{ fontSize: "1.2rem", color: "var(--sc-text-muted)", fontStyle: "italic" }}>
          {archetype.tagline}
        </p>
      </div>

      <div style={{ display: "grid", gap: "1.5rem", marginBottom: "3rem" }}>
        <Section title="The Core Pattern" content={synthesis.coreEssence || profile.biography} accent="var(--sc-gold)" />
        <Section title="Stress Dynamics" content={synthesis.stressPattern} accent="#f59e0b" />
        <Section title="Relationship Style" content={synthesis.relationshipPattern} accent="#f472b6" />
      </div>

      <div style={{ textAlign: "center", padding: "3rem 1.5rem", background: "rgba(28, 22, 53, 0.5)", borderRadius: "20px", border: "1px solid rgba(212,168,95,0.1)" }}>
        <IconLogo size={48} style={{ color: "var(--sc-gold)", marginBottom: "1.5rem", filter: "drop-shadow(0 0 10px rgba(212,168,95,0.4))" }} />
        <h3 className="heading-display" style={{ marginBottom: "1rem" }}>Build Your Own Blueprint</h3>
        <p style={{ color: "var(--sc-text-muted)", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>
          Discover your own soul architecture and behavioral loops.
        </p>
        <Link href="/">
          <ScButton size="lg">Start Your Reading</ScButton>
        </Link>
      </div>
    </motion.div>
  );
}

function Section({ title, content, accent }: { title: string; content?: string; accent: string }) {
  if (!content) return null;
  return (
    <div style={{ 
      background: "rgba(28, 22, 53, 0.7)", 
      padding: "2rem", 
      borderRadius: "16px", 
      border: `1px solid ${accent}20`,
      borderLeft: `4px solid ${accent}`,
      backdropFilter: "blur(10px)"
    }}>
      <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: "1rem", fontWeight: 700 }}>
        {title}
      </h3>
      <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--sc-ivory)", margin: 0 }}>
        {content}
      </p>
    </div>
  );
}
