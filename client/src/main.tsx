import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, useLocation, Link } from "wouter";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import "./index.css";

// ═══════════════════════════════════════════════════════════════════════════
// API HOOKS & QUERY CLIENT
// ═══════════════════════════════════════════════════════════════════════════

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// API fetch wrapper
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }
  return res.json();
}

// Auth hooks
function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => apiFetch<any>("/api/auth/user"),
  });
}

function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: () => apiFetch<any[]>("/api/profiles"),
  });
}

function useProfile(id: string | undefined) {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: () => apiFetch<any>(`/api/profiles/${id}`),
    enabled: !!id,
  });
}

function useDailyInsights(profileId: string | undefined) {
  return useQuery({
    queryKey: ["daily-insights", profileId],
    queryFn: () => apiFetch<any>(`/api/daily-insights/${profileId}`),
    enabled: !!profileId,
  });
}

function useEntitlements() {
  return useQuery({
    queryKey: ["entitlements"],
    queryFn: () => apiFetch<any>("/api/entitlements"),
  });
}

function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch<any>("/api/profiles", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiFetch<any>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string; name?: string }) =>
      apiFetch<any>("/api/auth/signup", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<any>("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      qc.clear();
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT - App State
// ═══════════════════════════════════════════════════════════════════════════

interface AppContextType {
  user: any;
  isLoading: boolean;
  profile: any;
  profiles: any[];
  refetch: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════════
// ICONS - Cosmic Symbol Set
// ═══════════════════════════════════════════════════════════════════════════

const Icons = {
  Sun: () => <span>☀️</span>,
  Moon: () => <span>🌙</span>,
  Star: () => <span>⭐</span>,
  Stars: () => <span>✨</span>,
  Sparkles: () => <span>💫</span>,
  Heart: () => <span>💜</span>,
  Fire: () => <span>🔥</span>,
  Water: () => <span>💧</span>,
  Earth: () => <span>🌍</span>,
  Air: () => <span>💨</span>,
  Eye: () => <span>👁️</span>,
  Compass: () => <span>🧭</span>,
  Crystal: () => <span>🔮</span>,
  Lotus: () => <span>🪷</span>,
  Infinity: () => <span>♾️</span>,
  Crown: () => <span>👑</span>,
  Wand: () => <span>🪄</span>,
  Scroll: () => <span>📜</span>,
  Chat: () => <span>💬</span>,
  Send: () => <span>➤</span>,
  Close: () => <span>✕</span>,
  Menu: () => <span>☰</span>,
  User: () => <span>👤</span>,
  Settings: () => <span>⚙️</span>,
  Home: () => <span>🏠</span>,
  Calendar: () => <span>📅</span>,
  Chart: () => <span>📊</span>,
  Link: () => <span>🔗</span>,
  Download: () => <span>⬇️</span>,
  ArrowRight: () => <span>→</span>,
  Check: () => <span>✓</span>,
  Plus: () => <span>+</span>,
};

// Zodiac signs
const ZodiacIcons: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS - Building Blocks
// ═══════════════════════════════════════════════════════════════════════════

// Motion variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

// Loading spinner
function LoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="spinner" style={{ width: size, height: size }} />
    </div>
  );
}

// Loading orb (mystical)
function LoadingOrb({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12">
      <div className="loading-orb" />
      {text && <p className="text-muted-foreground animate-pulse">{text}</p>}
    </div>
  );
}

// Glass card wrapper
function GlassCard({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <motion.div 
      className={`${hover ? 'glass-card' : 'glass-card-static'} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

// Button component
function Button({ 
  children, 
  variant = "primary", 
  size = "default", 
  onClick, 
  disabled,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "glow";
  size?: "default" | "large" | "icon";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const sizeClass = size === "large" ? "btn-large" : size === "icon" ? "btn-icon" : "";
  return (
    <button 
      type={type}
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Input component
function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  name,
}: {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  name?: string;
}) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <input
        type={type}
        name={name}
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}

// Progress ring for scores
function ProgressRing({ value, size = 120, strokeWidth = 8, color = "url(#gradient)" }: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--cosmic-purple)" />
            <stop offset="50%" stopColor="var(--cosmic-pink)" />
            <stop offset="100%" stopColor="var(--cosmic-cyan)" />
          </linearGradient>
        </defs>
        <circle
          className="bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className="progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="value gradient-text">{value}%</div>
    </div>
  );
}

// System badge
function SystemBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="system-badge">
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

function Navbar() {
  const { user, profile } = useApp();
  const [location] = useLocation();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link href="/" className="navbar-brand">
          <span style={{ fontSize: '1.5rem' }}>🔮</span>
          <span className="gradient-text">Soul Codex</span>
        </Link>
        
        <div className="navbar-nav">
          {profile && (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/daily">
                <Button variant="ghost">Daily</Button>
              </Link>
              <Link href="/compatibility">
                <Button variant="ghost">Compatibility</Button>
              </Link>
            </>
          )}
          
          {user ? (
            <Button variant="ghost" onClick={() => logout.mutate()}>
              Logout
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="secondary">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/contact">Contact</a>
        </div>
        <p>© 2025 Soul Codex - Engine of Eternal Now. Built with 💜 for seekers.</p>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGES - Landing Page
// ═══════════════════════════════════════════════════════════════════════════

function LandingPage() {
  const { profile } = useApp();
  const [, navigate] = useLocation();

  const features = [
    { icon: "☀️", title: "Western Astrology", desc: "Complete natal charts with houses, aspects & interpretations" },
    { icon: "🔢", title: "Numerology", desc: "Life path, destiny, soul urge & karmic numbers" },
    { icon: "⚡", title: "Human Design", desc: "Type, authority, centers, gates & channels" },
    { icon: "🌙", title: "Vedic Astrology", desc: "Jyotish charts with nakshatras & dashas" },
    { icon: "🐉", title: "Chinese Astrology", desc: "Animal signs, elements & pillars of destiny" },
    { icon: "🔮", title: "Gene Keys", desc: "Your hologenetic profile & golden path" },
    { icon: "☯️", title: "I Ching", desc: "Birth hexagram & life wisdom" },
    { icon: "✡️", title: "Kabbalah", desc: "Tree of Life & soul correction" },
    { icon: "🌀", title: "Mayan Astrology", desc: "Galactic signature & Tzolkin" },
    { icon: "🪷", title: "Chakra System", desc: "Energy center analysis & balancing" },
    { icon: "📐", title: "Sacred Geometry", desc: "Your geometric soul blueprint" },
    { icon: "ᚱ", title: "Runes", desc: "Elder Futhark wisdom for your path" },
    { icon: "🌟", title: "Fixed Stars", desc: "Stellar influences on your chart" },
    { icon: "🏺", title: "Arabic Parts", desc: "Fortune, spirit & destiny points" },
    { icon: "☄️", title: "Asteroids", desc: "Chiron, Lilith, Ceres & more" },
    { icon: "🌿", title: "Ayurveda", desc: "Constitutional dosha analysis" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-orb" style={{ top: '-20%', left: '-10%' }} />
        <div className="hero-orb-pink" style={{ bottom: '-10%', right: '-5%' }} />
        
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            style={{ fontSize: '4rem', marginBottom: '1rem' }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🔮
          </motion.div>
          <h1 className="hero-title">
            <span className="gradient-text">Soul Codex</span>
          </h1>
          <p className="hero-subtitle">
            Engine of Eternal Now — Discover your cosmic blueprint through 30+ mystical systems.
            Astrology, numerology, Human Design, and AI-powered spiritual guidance unified in one transformative experience.
          </p>
          <div className="hero-buttons">
            {profile ? (
              <Button variant="glow" size="large" onClick={() => navigate('/dashboard')}>
                <Icons.Crystal /> View Your Soul Profile
              </Button>
            ) : (
              <>
                <Button variant="glow" size="large" onClick={() => navigate('/create')}>
                  <Icons.Sparkles /> Begin Your Journey
                </Button>
                <Button variant="secondary" size="large" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="gradient-text">30+ Mystical Systems</span>
            </h2>
            <p className="section-description">
              The most comprehensive soul analysis ever created. Every system works together to reveal your complete cosmic identity.
            </p>
          </div>
          
          <motion.div 
            className="feature-grid"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                className="glass-card feature-card"
                variants={fadeIn}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container text-center">
          <GlassCard className="p-8">
            <h2 className="section-title mb-4">
              Ready to <span className="gradient-text">Unlock Your Soul</span>?
            </h2>
            <p className="section-description mb-6">
              Enter your birth data and receive your complete cosmic blueprint in minutes.
              No account required to start.
            </p>
            <Button variant="glow" size="large" onClick={() => navigate('/create')}>
              <Icons.Wand /> Create Your Soul Profile
            </Button>
          </GlassCard>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGES - Profile Creation
// ═══════════════════════════════════════════════════════════════════════════

function CreateProfilePage() {
  const [, navigate] = useLocation();
  const createProfile = useCreateProfile();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    latitude: "",
    longitude: "",
    timezone: "",
  });
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleLocationSearch = useCallback(async (query: string) => {
    setForm(f => ({ ...f, birthLocation: query }));
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      // Using OpenStreetMap Nominatim for geocoding
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await res.json();
      setLocationSuggestions(data.map((item: any) => ({
        name: item.display_name,
        lat: item.lat,
        lon: item.lon,
      })));
    } catch (e) {
      console.error("Location search failed:", e);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const selectLocation = (loc: any) => {
    setForm(f => ({
      ...f,
      birthLocation: loc.name.split(',')[0] + ', ' + (loc.name.split(',').slice(-1)[0] || '').trim(),
      latitude: loc.lat,
      longitude: loc.lon,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }));
    setLocationSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createProfile.mutateAsync(form);
      navigate(`/profile/${result.id}`);
    } catch (error) {
      console.error("Failed to create profile:", error);
    }
  };

  const canProceed = step === 1 
    ? form.name && form.birthDate
    : form.birthTime && form.birthLocation && form.latitude;

  return (
    <div className="container" style={{ maxWidth: 600, padding: '3rem 1rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
          <h1 className="gradient-text mb-4">Create Your Soul Profile</h1>
          <p className="text-muted-foreground">
            Step {step} of 2 — {step === 1 ? "Basic Information" : "Birth Details"}
          </p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1" {...fadeIn} className="flex flex-col gap-4">
                  <Input
                    label="Your Name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                  <Input
                    label="Birth Date"
                    type="date"
                    value={form.birthDate}
                    onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                    required
                  />
                  <Button 
                    variant="primary" 
                    onClick={() => setStep(2)} 
                    disabled={!canProceed}
                    className="mt-4"
                  >
                    Continue <Icons.ArrowRight />
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="step2" {...fadeIn} className="flex flex-col gap-4">
                  <Input
                    label="Birth Time (for accurate charts)"
                    type="time"
                    value={form.birthTime}
                    onChange={e => setForm(f => ({ ...f, birthTime: e.target.value }))}
                    required
                  />
                  
                  <div className="form-group">
                    <label className="label">Birth Location</label>
                    <input
                      className="input"
                      placeholder="Search city or town..."
                      value={form.birthLocation}
                      onChange={e => handleLocationSearch(e.target.value)}
                    />
                    {locationSuggestions.length > 0 && (
                      <div className="glass-card-static mt-2 p-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {locationSuggestions.map((loc, i) => (
                          <div
                            key={i}
                            className="p-2 rounded cursor-pointer hover:bg-muted"
                            onClick={() => selectLocation(loc)}
                            style={{ fontSize: '0.875rem' }}
                          >
                            {loc.name}
                          </div>
                        ))}
                      </div>
                    )}
                    {isSearching && <p className="text-muted-foreground mt-2">Searching...</p>}
                    {form.latitude && (
                      <p className="text-muted-foreground mt-2" style={{ fontSize: '0.75rem' }}>
                        📍 {form.latitude}, {form.longitude}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 mt-4">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      variant="glow" 
                      disabled={!canProceed || createProfile.isPending}
                      className="flex-1"
                    >
                      {createProfile.isPending ? (
                        <>Generating Your Cosmic Blueprint...</>
                      ) : (
                        <>Create Soul Profile <Icons.Sparkles /></>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </GlassCard>

        {createProfile.isError && (
          <motion.div 
            className="glass-card-static p-4 mt-4 text-center"
            style={{ borderColor: 'var(--destructive)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p style={{ color: 'var(--destructive)' }}>
              {(createProfile.error as Error)?.message || "Failed to create profile. Please try again."}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGES - Dashboard / Soul Profile
// ═══════════════════════════════════════════════════════════════════════════

function DashboardPage() {
  const { profiles } = useApp();
  const [, navigate] = useLocation();
  const profile = profiles?.[0];

  if (!profile) {
    return (
      <div className="container text-center py-8">
        <GlassCard className="p-8">
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🌟</div>
          <h2 className="mb-4">No Soul Profile Yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your cosmic blueprint to unlock insights from 30+ mystical systems.
          </p>
          <Button variant="glow" onClick={() => navigate('/create')}>
            <Icons.Sparkles /> Create Your Profile
          </Button>
        </GlassCard>
      </div>
    );
  }

  return <ProfileView profileId={profile.id} />;
}

function ProfileView({ profileId }: { profileId: string }) {
  const { data: profile, isLoading } = useProfile(profileId);
  const [activeTab, setActiveTab] = useState("soul-archetype");

  if (isLoading) {
    return <LoadingOrb text="Loading your cosmic blueprint..." />;
  }

  if (!profile) {
    return <div className="container p-8 text-center">Profile not found</div>;
  }

  const astro = profile.astrologyData;
  const numData = profile.numerologyData;
  const hdData = profile.humanDesignData;
  const archetype = profile.archetypeData;

  const tabs = [
    { id: "soul-archetype", label: "Soul Archetype", icon: "👑" },
    { id: "elements", label: "Elements", icon: "🌍" },
    { id: "overview", label: "Overview", icon: "🌟" },
    { id: "astrology", label: "Astrology", icon: "☀️" },
    { id: "numerology", label: "Numerology", icon: "🔢" },
    { id: "human-design", label: "Human Design", icon: "⚡" },
    { id: "esoteric", label: "Esoteric", icon: "🔮" },
    { id: "wellness", label: "Wellness", icon: "🌿" },
  ];

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Profile Header */}
      <GlassCard className="profile-header mb-6">
        <div className="profile-avatar">
          {astro?.sunSign ? ZodiacIcons[astro.sunSign] || "✨" : "✨"}
        </div>
        <div className="profile-info">
          <h1 className="profile-name gradient-text">{profile.name}</h1>
          {archetype?.title && (
            <p className="profile-archetype">{archetype.title}</p>
          )}
          <div className="profile-meta">
            {astro?.sunSign && <SystemBadge icon={ZodiacIcons[astro.sunSign]} label={`Sun in ${astro.sunSign}`} />}
            {astro?.moonSign && <SystemBadge icon="🌙" label={`Moon in ${astro.moonSign}`} />}
            {numData?.lifePath && <SystemBadge icon="🔢" label={`Life Path ${numData.lifePath}`} />}
            {hdData?.type && <SystemBadge icon="⚡" label={hdData.type} />}
          </div>
        </div>
      </GlassCard>

      {/* Tab Navigation */}
      <div className="system-tabs mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`system-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...fadeIn}>
          {activeTab === "soul-archetype" && <SoulArchetypeSection profile={profile} />}
          {activeTab === "elements" && <ElementalMedicineSection profile={profile} />}
          {activeTab === "overview" && <ProfileOverview profile={profile} />}
          {activeTab === "astrology" && <AstrologySection profile={profile} />}
          {activeTab === "numerology" && <NumerologySection profile={profile} />}
          {activeTab === "human-design" && <HumanDesignSection profile={profile} />}
          {activeTab === "esoteric" && <EsotericSection profile={profile} />}
          {activeTab === "wellness" && <WellnessSection profile={profile} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProfileOverview({ profile }: { profile: any }) {
  const archetype = profile.archetypeData;

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      {/* Archetype Card */}
      {archetype && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="zodiac-icon">👑</div>
            <div>
              <h3 className="card-title gradient-text">{archetype.title}</h3>
              <p className="card-description">Your Soul Archetype</p>
            </div>
          </div>
          <p className="text-muted-foreground mb-4" style={{ lineHeight: 1.7 }}>
            {archetype.description}
          </p>
          {archetype.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {archetype.keywords.map((kw: string, i: number) => (
                <span key={i} className="system-badge">{kw}</span>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Biography */}
      {profile.biography && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="zodiac-icon">📜</div>
            <h3 className="card-title">Your Soul Biography</h3>
          </div>
          <p className="text-muted-foreground" style={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {profile.biography}
          </p>
        </GlassCard>
      )}

      {/* Daily Guidance */}
      {profile.dailyGuidance && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="zodiac-icon">✨</div>
            <h3 className="card-title">Cosmic Guidance</h3>
          </div>
          <p className="text-muted-foreground" style={{ lineHeight: 1.8 }}>
            {profile.dailyGuidance}
          </p>
        </GlassCard>
      )}

      {/* Strengths & Shadows */}
      {archetype?.strengths?.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="card-title mb-4">💪 Core Strengths</h3>
          <ul className="flex flex-col gap-2">
            {archetype.strengths.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <span style={{ color: 'var(--cosmic-cyan)' }}>✓</span> {s}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {archetype?.shadows?.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="card-title mb-4">🌑 Shadow Aspects</h3>
          <ul className="flex flex-col gap-2">
            {archetype.shadows.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <span style={{ color: 'var(--cosmic-pink)' }}>○</span> {s}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* Tarot Birth Cards */}
      {archetype?.tarotCards?.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="card-title mb-4">🎴 Birth Cards</h3>
          <div className="flex flex-wrap gap-3">
            {archetype.tarotCards.map((card: any, i: number) => (
              <div key={i} className="system-badge" style={{ padding: '0.5rem 1rem' }}>
                {card.name || card}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function AstrologySection({ profile }: { profile: any }) {
  const astro = profile.astrologyData;
  if (!astro) return <EmptySection message="Astrology data requires complete birth time and location." />;

  const planets = astro.planets || {};
  const houses = astro.houses || [];

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      {/* Big 3 */}
      <GlassCard className="p-6">
        <h3 className="card-title mb-4">☀️ The Big Three</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="zodiac-icon">{ZodiacIcons[astro.sunSign] || "☀️"}</div>
            <div>
              <div className="font-semibold">Sun in {astro.sunSign}</div>
              <div className="text-muted-foreground text-sm">Core identity & ego</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="zodiac-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              {ZodiacIcons[astro.moonSign] || "🌙"}
            </div>
            <div>
              <div className="font-semibold">Moon in {astro.moonSign}</div>
              <div className="text-muted-foreground text-sm">Emotional nature</div>
            </div>
          </div>
          {astro.risingSign && (
            <div className="flex items-center gap-3">
              <div className="zodiac-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' }}>
                {ZodiacIcons[astro.risingSign] || "⬆️"}
              </div>
              <div>
                <div className="font-semibold">Rising in {astro.risingSign}</div>
                <div className="text-muted-foreground text-sm">Outer persona</div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Planets Grid */}
      <GlassCard className="p-6">
        <h3 className="card-title mb-4">🪐 Planetary Positions</h3>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {Object.entries(planets).map(([planet, data]: [string, any]) => (
            <div key={planet} className="flex items-center gap-2">
              <span className="system-badge">
                {ZodiacIcons[data?.sign] || "•"} {planet}
              </span>
              <span className="text-muted-foreground text-sm">{data?.sign}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Houses */}
      {houses.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="card-title mb-4">🏠 Houses</h3>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {houses.map((house: any, i: number) => (
              <div key={i} className="text-center p-2 rounded" style={{ background: 'var(--muted)' }}>
                <div className="text-sm font-semibold">{i + 1}</div>
                <div className="text-muted-foreground text-xs">{ZodiacIcons[house?.sign] || house?.sign}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Interpretations */}
      {astro.interpretations && (
        <GlassCard className="p-6" style={{ gridColumn: 'span 2' }}>
          <h3 className="card-title mb-4">📖 Interpretations</h3>
          <div className="flex flex-col gap-4">
            {Object.entries(astro.interpretations).slice(0, 5).map(([key, text]: [string, any]) => (
              <div key={key}>
                <div className="font-semibold text-cosmic-lavender mb-1">{key.replace(/_/g, ' ')}</div>
                <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function NumerologySection({ profile }: { profile: any }) {
  const numData = profile.numerologyData;
  if (!numData) return <EmptySection message="Numerology data not available." />;

  const coreNumbers = [
    { label: "Life Path", value: numData.lifePath, icon: "🛤️", desc: "Your soul's purpose" },
    { label: "Destiny", value: numData.destiny, icon: "🎯", desc: "Your life's mission" },
    { label: "Soul Urge", value: numData.soulUrge, icon: "💖", desc: "Inner desires" },
    { label: "Personality", value: numData.personality, icon: "🎭", desc: "How others see you" },
    { label: "Maturity", value: numData.maturity, icon: "🌳", desc: "Later life energy" },
    { label: "Birthday", value: numData.birthday, icon: "🎂", desc: "Special talents" },
  ];

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      {coreNumbers.filter(n => n.value).map((num, i) => (
        <GlassCard key={i} className="p-6 text-center">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{num.icon}</div>
          <div className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 700 }}>{num.value}</div>
          <div className="font-semibold mt-2">{num.label} Number</div>
          <div className="text-muted-foreground text-sm">{num.desc}</div>
        </GlassCard>
      ))}

      {/* Interpretations */}
      {numData.interpretations && (
        <GlassCard className="p-6" style={{ gridColumn: '1 / -1' }}>
          <h3 className="card-title mb-4">📖 Number Interpretations</h3>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {Object.entries(numData.interpretations).map(([key, text]: [string, any]) => (
              <div key={key}>
                <div className="font-semibold text-cosmic-lavender mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function HumanDesignSection({ profile }: { profile: any }) {
  const hd = profile.humanDesignData;
  if (!hd) return <EmptySection message="Human Design requires exact birth time and location." />;

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      {/* Type & Strategy */}
      <GlassCard className="p-6">
        <h3 className="card-title mb-4">⚡ Your Design</h3>
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-muted-foreground text-sm">Type</div>
            <div className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 600 }}>{hd.type}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm">Strategy</div>
            <div className="font-semibold">{hd.strategy}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm">Authority</div>
            <div className="font-semibold">{hd.authority}</div>
          </div>
          {hd.profile && (
            <div>
              <div className="text-muted-foreground text-sm">Profile</div>
              <div className="font-semibold">{hd.profile}</div>
            </div>
          )}
          {hd.notSelf && (
            <div>
              <div className="text-muted-foreground text-sm">Not-Self Theme</div>
              <div className="font-semibold">{hd.notSelf}</div>
            </div>
          )}
          {hd.signature && (
            <div>
              <div className="text-muted-foreground text-sm">Signature</div>
              <div className="font-semibold">{hd.signature}</div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Definition */}
      {hd.definition && (
        <GlassCard className="p-6">
          <h3 className="card-title mb-4">🔗 Definition</h3>
          <div className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{hd.definition}</div>
          <p className="text-muted-foreground mt-2 text-sm">
            {hd.definition === "Single" && "All your defined centers are connected. You are self-contained."}
            {hd.definition === "Split" && "Two separate areas of definition. You seek others to bridge the gap."}
            {hd.definition === "Triple Split" && "Three areas of definition. Complex social needs."}
            {hd.definition === "Quadruple Split" && "Four areas of definition. Requires time to process."}
          </p>
        </GlassCard>
      )}

      {/* Centers */}
      {hd.centers && (
        <GlassCard className="p-6">
          <h3 className="card-title mb-4">⚙️ Energy Centers</h3>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {Object.entries(hd.centers).map(([center, defined]: [string, any]) => (
              <div 
                key={center} 
                className="text-center p-2 rounded"
                style={{ 
                  background: defined ? 'var(--cosmic-purple)' : 'var(--muted)',
                  opacity: defined ? 1 : 0.5
                }}
              >
                <div className="text-xs">{center}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Incarnation Cross */}
      {hd.incarnationCross && (
        <GlassCard className="p-6">
          <h3 className="card-title mb-4">✝️ Incarnation Cross</h3>
          <div className="font-semibold text-cosmic-lavender">{hd.incarnationCross}</div>
          <p className="text-muted-foreground mt-2 text-sm">
            Your life purpose and the theme of your soul's journey in this incarnation.
          </p>
        </GlassCard>
      )}
    </div>
  );
}

function EsotericSection({ profile }: { profile: any }) {
  const sections = [
    { title: "Chinese Astrology", icon: "🐉", data: profile.chineseAstrologyData, fields: ['animal', 'element', 'year'] },
    { title: "Vedic Astrology", icon: "🌙", data: profile.vedicAstrologyData, fields: ['ascendant', 'moonSign', 'nakshatra'] },
    { title: "Gene Keys", icon: "🧬", data: profile.geneKeysData, fields: ['lifeWork', 'evolution', 'radiance', 'purpose'] },
    { title: "I Ching", icon: "☯️", data: profile.iChingData, fields: ['hexagram', 'name', 'meaning'] },
    { title: "Kabbalah", icon: "✡️", data: profile.kabbalahData, fields: ['soulPath', 'treePosition'] },
    { title: "Mayan Astrology", icon: "🌀", data: profile.mayanAstrologyData, fields: ['sign', 'tone', 'galacticSignature'] },
    { title: "Runes", icon: "ᚱ", data: profile.runesData, fields: ['primaryRune', 'meaning'] },
    { title: "Sabian Symbols", icon: "🌟", data: profile.sabianSymbolsData, fields: ['sunSymbol', 'moonSymbol'] },
  ];

  const validSections = sections.filter(s => s.data);

  if (validSections.length === 0) {
    return <EmptySection message="Esoteric systems require complete birth data for calculation." />;
  }

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      {validSections.map((section, i) => (
        <GlassCard key={i} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="zodiac-icon">{section.icon}</div>
            <h3 className="card-title">{section.title}</h3>
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(section.data)
              .filter(([key]) => !key.includes('interpretation'))
              .slice(0, 6)
              .map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-semibold text-sm">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                </div>
              ))}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function WellnessSection({ profile }: { profile: any }) {
  const ayurveda = profile.ayurvedaData;
  const chakras = profile.chakraData;
  const biorhythms = profile.biorhythmsData;

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      {/* Ayurveda */}
      {ayurveda && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="zodiac-icon">🌿</div>
            <h3 className="card-title">Ayurveda</h3>
          </div>
          <div className="flex flex-col gap-3">
            {ayurveda.primaryDosha && (
              <div>
                <div className="text-muted-foreground text-sm">Primary Dosha</div>
                <div className="font-semibold text-cosmic-lavender">{ayurveda.primaryDosha}</div>
              </div>
            )}
            {ayurveda.constitution && (
              <div>
                <div className="text-muted-foreground text-sm">Constitution</div>
                <div className="font-semibold">{ayurveda.constitution}</div>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Chakras */}
      {chakras && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="zodiac-icon">🪷</div>
            <h3 className="card-title">Chakra System</h3>
          </div>
          <div className="flex flex-col gap-2">
            {chakras.dominantChakra && (
              <div>
                <div className="text-muted-foreground text-sm">Dominant Chakra</div>
                <div className="font-semibold gradient-text">{chakras.dominantChakra}</div>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Biorhythms */}
      {biorhythms && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="zodiac-icon">📈</div>
            <h3 className="card-title">Biorhythms</h3>
          </div>
          <div className="grid gap-3">
            {['physical', 'emotional', 'intellectual'].map(type => (
              biorhythms[type] !== undefined && (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{type}</span>
                    <span>{Math.round(biorhythms[type])}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--muted)' }}>
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${Math.abs(biorhythms[type])}%`,
                        background: biorhythms[type] >= 0 ? 'var(--cosmic-purple)' : 'var(--cosmic-pink)'
                      }}
                    />
                  </div>
                </div>
              )
            ))}
          </div>
        </GlassCard>
      )}

      {/* Palmistry */}
      {profile.palmistryData && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="zodiac-icon">✋</div>
            <h3 className="card-title">Palm Reading</h3>
          </div>
          <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.6 }}>
            {typeof profile.palmistryData === 'string' 
              ? profile.palmistryData 
              : profile.palmistryData.overview || "Your palm reveals unique patterns of destiny."}
          </p>
        </GlassCard>
      )}

      {/* Sacred Geometry */}
      {profile.sacredGeometryData && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="zodiac-icon">📐</div>
            <h3 className="card-title">Sacred Geometry</h3>
          </div>
          {profile.sacredGeometryData.primaryShape && (
            <div>
              <div className="text-muted-foreground text-sm">Primary Shape</div>
              <div className="font-semibold text-cosmic-lavender">{profile.sacredGeometryData.primaryShape}</div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SOUL ARCHETYPE SECTION - "THE QUIET STORM ARCHITECT"
// ═══════════════════════════════════════════════════════════════════════════

function SoulArchetypeSection({ profile }: { profile: any }) {
  const numData = profile.numerologyData;
  const hdData = profile.humanDesignData;
  const astro = profile.astrologyData;
  
  // Calculate archetype based on profile data
  const lifePath = numData?.lifePath || 7;
  const hdType = hdData?.type;
  
  // Determine archetype
  let archetypeKey = 'quiet-storm';
  if (lifePath === 1 || lifePath === 8) archetypeKey = 'visionary';
  else if (lifePath === 2 || lifePath === 6 || lifePath === 9) archetypeKey = 'healer';
  else if (lifePath === 4 || lifePath === 22) archetypeKey = 'guardian';
  else if (lifePath === 3 || lifePath === 5) archetypeKey = 'creator';
  
  if (hdType === 'Manifestor') archetypeKey = 'visionary';
  if (hdType === 'Projector' || hdType === 'Reflector') archetypeKey = 'healer';
  
  const archetypes: Record<string, any> = {
    'quiet-storm': {
      title: 'The Quiet Storm Architect',
      subtitle: 'Builder of Worlds',
      emoji: '🏛️',
      coreEssence: `You're a builder of worlds — physical, emotional, spiritual, creative. Everything you touch becomes a blueprint, a system, or a legacy. Your mind works like a map: you see the structure behind chaos, the patterns beneath people, the future inside the present.

You're a transformer soul.
You don't stay the same version for long —
you evolve through fire.`,
      strengths: ['Insightful as hell', 'Deep loyalty', 'Protective but calm', 'Quiet leader energy', 'Creative architect mind', 'Natural problem-solver', 'Old soul intuition'],
      shadows: ['You absorb pain instead of expressing it', 'You shut down when disappointed', 'You try to fix what should be walked away from', 'You carry burdens alone', 'You love deeper than you admit'],
      purpose: 'To build something enduring. A world, a family legacy, an empire, a story universe — something that outlives you.',
      soulFrequency: 'Warrior heart + creator mind + healer spirit',
      firstPersonBio: `I'm not the loudest in the room, but I'm the one who sees everything. I move with purpose, not noise. I'm loyal, real, and I care deeper than I ever show. I build things — ideas, stories, futures, systems — because that's where my mind comes alive. I've been through shit, but I don't break. I evolve. I protect the people I love, even when they don't know it. I don't waste time on fake energy or small talk. I'm here to build something that actually matters. That's who I am.`,
      romanticTitle: 'The Loyal Firekeeper',
      romanticHow: `You love with intensity, loyalty, and honesty. You don't do shallow. When you're in, you're in. You give protection, passion, presence, and depth — the kind that can't be faked.`,
      romanticTraits: ['Protective', 'Emotionally intuitive', 'Honest, even when blunt', 'Loyal to the bone', 'Quietly affectionate', 'Needs emotional safety'],
      romanticCraves: `Someone who's real — no dramas, no games, no pretending. Someone who stands beside you, not behind you or above you. Someone who respects your loyalty and earns your softness.`,
      romanticShadow: ['You carry the relationship on your back', `You don't speak hurt — you swallow it`, 'You forgive too deeply', 'You try to heal people at your own expense'],
      romanticNeeds: ['Stability', 'Honesty', 'Emotional intelligence', 'Loyalty', 'Calm strength'],
      powerMode: ['Architect energy active', 'Clear boundaries', 'Centered and calm', 'Direct with your truth', 'Creating instead of reacting', 'Building something big', 'Leading without saying a word'],
      shadowMode: ['Silent when hurt', 'Overthinking', 'Carrying everyone', 'Trust issues', 'Feeling misunderstood', 'Feeling responsible for everything', 'Trying to fix people who can\'t be fixed']
    },
    'healer': {
      title: 'The Mystic Healer',
      subtitle: 'Channel of Light',
      emoji: '🌙',
      coreEssence: `You're a bridge between worlds — the seen and unseen, the broken and whole. Your presence alone shifts energy in a room. You feel everything, sometimes too much, but that sensitivity is your superpower.

You're a transmuter of pain.
What breaks others, you alchemize into wisdom.`,
      strengths: ['Profound empathy', 'Natural healer energy', 'Spiritual depth', 'Intuitive knowing', 'Gentle strength', 'Transformative presence', 'Wisdom beyond years'],
      shadows: ['You absorb others\' pain as your own', 'You neglect your own needs for others', 'Boundaries feel like walls to you', 'You over-give until empty', 'You attract broken people to fix'],
      purpose: 'To heal what others cannot see. To be the medicine for souls who have forgotten their light.',
      soulFrequency: 'Healer heart + mystic mind + warrior spirit',
      firstPersonBio: `I feel things others don't notice. It's not a choice — it's how I'm wired. I've learned to carry that weight, to transmute pain into understanding. People come to me when they're broken, and I don't turn them away. But I'm learning that I need healing too. My power isn't in fixing — it's in holding space. I'm here to remind people of their own light.`,
      romanticTitle: 'The Soul Tender',
      romanticHow: `You love through presence, understanding, and spiritual connection. For you, intimacy is soul-deep. You see your partner's wounds and love them anyway.`,
      romanticTraits: ['Deeply empathic lover', 'Nurturing presence', 'Spiritually connected', 'Intuitive about partner\'s needs', 'Healing through love'],
      romanticCraves: `Someone who sees your depth without drowning in it. A partner who can hold space for you, not just receive your care.`,
      romanticShadow: ['You lose yourself in your partner', 'You attract wounded souls to fix', 'You give until empty'],
      romanticNeeds: ['Spiritual connection', 'Mutual nurturing', 'Emotional reciprocity', 'Space for your healing'],
      powerMode: ['Healer energy flowing', 'Boundaries with compassion', 'Receiving as much as giving', 'Channeling light', 'Grounded in your gifts'],
      shadowMode: ['Absorbing everyone\'s pain', 'Neglecting self-care', 'Attracting broken people', 'Feeling drained', 'Losing yourself']
    },
    'visionary': {
      title: 'The Visionary Revolutionary',
      subtitle: 'Breaker of Chains',
      emoji: '⚡',
      coreEssence: `You see what others can't — the future, the truth, the possibility. You're not here to fit in; you're here to reshape reality. Your mind operates ahead of time, and your soul refuses to accept "impossible."

You're a pattern-breaker.
What holds others down, you burn through.`,
      strengths: ['Visionary thinking', 'Fearless authenticity', 'Innovation mastery', 'Magnetic presence', 'Strategic brilliance', 'Unshakeable conviction', 'Catalyst energy'],
      shadows: ['Impatience with slower minds', 'Isolation from feeling misunderstood', 'Burning bridges too fast', 'Difficulty with mundane tasks', 'Exhaustion from carrying the vision alone'],
      purpose: 'To shatter limitations and build the future others are afraid to imagine.',
      soulFrequency: 'Visionary mind + rebel heart + creator spirit',
      firstPersonBio: `I see the future before it arrives. I don't follow trends — I set them. People call me intense, ahead of my time, sometimes difficult. That's because I refuse to accept limitations that everyone else just tolerates. I'm here to break patterns, not repeat them. My vision is my power.`,
      romanticTitle: 'The Flame Keeper',
      romanticHow: `You love with intensity and vision. You see your partner's potential and help them rise to it. Your passion is magnetic but can be overwhelming.`,
      romanticTraits: ['Intensely passionate', 'Visionary about the relationship', 'Demanding of authenticity', 'Protective of your time', 'All or nothing'],
      romanticCraves: `Someone who can match your intensity. A partner who has their own vision and doesn't shrink from yours.`,
      romanticShadow: ['Expecting too much too fast', 'Impatience with partner\'s growth', 'Running from boredom'],
      romanticNeeds: ['Intellectual stimulation', 'Shared vision', 'Independence', 'Passionate connection'],
      powerMode: ['Vision crystal clear', 'Leading with conviction', 'Building the future', 'Inspiring others', 'Breaking limits'],
      shadowMode: ['Isolated in your vision', 'Impatient with reality', 'Burning out', 'Feeling alone at the top']
    },
    'guardian': {
      title: 'The Guardian Protector',
      subtitle: 'Shield of the Sacred',
      emoji: '🛡️',
      coreEssence: `You're the one who stands between chaos and those you love. Protection isn't a choice for you — it's coded into your soul. You move in silence but strike with precision when needed.

You're a silent fortress.
Your strength is in your stillness.`,
      strengths: ['Fierce loyalty', 'Calm under pressure', 'Protective instinct', 'Strategic patience', 'Physical presence', 'Dependable strength', 'Quiet authority'],
      shadows: ['Carrying weight that isn\'t yours', 'Suppressing vulnerability', 'Hypervigilance exhaustion', 'Difficulty receiving help', 'Over-responsibility for others\' safety'],
      purpose: 'To be the shield. To protect what is sacred when no one else will.',
      soulFrequency: 'Warrior heart + guardian mind + protector spirit',
      firstPersonBio: `I'm the one who shows up when it matters. I don't talk about loyalty — I live it. When someone I love is threatened, I don't hesitate. I move in silence, but my presence speaks. Protection isn't a role I play. It's who I am at my core.`,
      romanticTitle: 'The Steady Flame',
      romanticHow: `You love through protection, consistency, and unwavering presence. You're the rock your partner can always lean on.`,
      romanticTraits: ['Steadfast devotion', 'Protective love', 'Actions over words', 'Physical presence', 'Unshakeable loyalty'],
      romanticCraves: `Someone who appreciates your protection without taking it for granted. A partner who doesn't mistake your silence for coldness.`,
      romanticShadow: ['Difficulty expressing feelings', 'Overprotecting', 'Neglecting your own needs'],
      romanticNeeds: ['Trust', 'Appreciation', 'Physical affection', 'Stability'],
      powerMode: ['Protective energy balanced', 'Present and grounded', 'Receiving help gracefully', 'Strong but soft', 'Clear priorities'],
      shadowMode: ['Hypervigilant', 'Carrying everyone', 'Suppressing emotions', 'Exhausted from protecting']
    },
    'creator': {
      title: 'The Cosmic Creator',
      subtitle: 'Weaver of Realities',
      emoji: '✨',
      coreEssence: `You don't just imagine worlds — you build them. Art, stories, systems, experiences — your mind is a universe generator. Creation isn't a hobby; it's your soul's native language.

You're a world-weaver.
What you envision, you manifest.`,
      strengths: ['Boundless creativity', 'Original thinking', 'Artistic vision', 'Universe-building mind', 'Emotional depth in creation', 'Prolific output', 'Timeless perspective'],
      shadows: ['Perfectionism paralysis', 'Difficulty finishing projects', 'Isolation in creative worlds', 'Undervaluing your work', 'Losing yourself in creation'],
      purpose: 'To create what has never existed. To leave beauty, meaning, and wonder behind.',
      soulFrequency: 'Creator heart + cosmic mind + artist spirit',
      firstPersonBio: `I see universes where others see blank pages. My mind never stops creating — stories, worlds, systems, art. It's not a hobby; it's my soul's language. I'm here to leave something behind that didn't exist before me.`,
      romanticTitle: 'The Muse Keeper',
      romanticHow: `You love through creation — making things for your partner, seeing them as art. You need a relationship that feeds your creativity, not drains it.`,
      romanticTraits: ['Creative expressions of love', 'Deep emotional connection', 'Need for inspiration', 'Unconventional romance', 'Soul-deep intimacy'],
      romanticCraves: `A muse who inspires you. Someone who understands your creative obsessions and supports your visions.`,
      romanticShadow: ['Losing yourself in projects', 'Partner feeling secondary to art', 'Emotional unavailability when creating'],
      romanticNeeds: ['Creative freedom', 'Inspiration', 'Deep understanding', 'Space to create'],
      powerMode: ['Creating freely', 'Finishing projects', 'Sharing your work', 'Inspired and flowing', 'Connected to source'],
      shadowMode: ['Perfectionism paralysis', 'Procrastinating on art', 'Feeling blocked', 'Undervaluing your gifts']
    }
  };
  
  const arch = archetypes[archetypeKey];
  const [showPowerMode, setShowPowerMode] = useState(true);

  return (
    <div className="grid gap-6">
      {/* Main Archetype Card */}
      <GlassCard className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="zodiac-icon" style={{ width: '5rem', height: '5rem', fontSize: '2.5rem' }}>
            {arch.emoji}
          </div>
          <div>
            <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700 }}>{arch.title}</h2>
            <p className="text-cosmic-lavender" style={{ fontSize: '1.1rem' }}>{arch.subtitle}</p>
          </div>
        </div>
        
        <div className="mb-6" style={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: 'var(--muted-foreground)' }}>
          {arch.coreEssence}
        </div>
        
        <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)' }}>
          <p className="text-center" style={{ fontStyle: 'italic', color: 'var(--cosmic-lavender)' }}>
            <strong>Soul Frequency:</strong> {arch.soulFrequency}
          </p>
        </div>
      </GlassCard>
      
      {/* First Person Bio */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="zodiac-icon">📜</div>
          <h3 className="card-title">Who I Am — In My Own Words</h3>
        </div>
        <blockquote style={{ 
          borderLeft: '3px solid var(--cosmic-purple)', 
          paddingLeft: '1.5rem', 
          fontStyle: 'italic',
          lineHeight: 1.8,
          color: 'var(--foreground)'
        }}>
          "{arch.firstPersonBio}"
        </blockquote>
      </GlassCard>
      
      {/* Strengths & Shadows */}
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <GlassCard className="p-6">
          <h3 className="card-title mb-4">💪 Core Strengths</h3>
          <ul className="flex flex-col gap-2">
            {arch.strengths.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span style={{ color: 'var(--cosmic-cyan)' }}>✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
        
        <GlassCard className="p-6">
          <h3 className="card-title mb-4">🌑 Shadow Aspects</h3>
          <ul className="flex flex-col gap-2">
            {arch.shadows.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span style={{ color: 'var(--cosmic-pink)' }}>○</span>
                <span className="text-muted-foreground">{s}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
      
      {/* Purpose */}
      <GlassCard className="p-6 text-center">
        <h3 className="card-title mb-4">🎯 Your Purpose</h3>
        <p style={{ fontSize: '1.25rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
          {arch.purpose}
        </p>
      </GlassCard>
      
      {/* Romantic Profile */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="zodiac-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' }}>💜</div>
          <div>
            <h3 className="card-title">Romantic Energy Profile</h3>
            <p className="text-cosmic-rose">{arch.romanticTitle}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">How You Love:</h4>
          <p className="text-muted-foreground" style={{ lineHeight: 1.7 }}>{arch.romanticHow}</p>
        </div>
        
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <h4 className="font-semibold mb-2 text-cosmic-cyan">Your Romantic Traits:</h4>
            <ul className="flex flex-col gap-1">
              {arch.romanticTraits.map((t: string, i: number) => (
                <li key={i} className="text-muted-foreground text-sm">• {t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-cosmic-pink">Shadow in Love:</h4>
            <ul className="flex flex-col gap-1">
              {arch.romanticShadow.map((s: string, i: number) => (
                <li key={i} className="text-muted-foreground text-sm">• {s}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--muted)' }}>
          <h4 className="font-semibold mb-2">You Crave:</h4>
          <p className="text-muted-foreground text-sm">{arch.romanticCraves}</p>
        </div>
        
        <div className="mt-4">
          <h4 className="font-semibold mb-2">What You Need:</h4>
          <div className="flex flex-wrap gap-2">
            {arch.romanticNeeds.map((n: string, i: number) => (
              <span key={i} className="system-badge">{n}</span>
            ))}
          </div>
        </div>
      </GlassCard>
      
      {/* Power Mode vs Shadow Mode */}
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title">Mode Status</h3>
          <div className="flex gap-2">
            <button 
              className={`system-tab ${showPowerMode ? 'active' : ''}`}
              onClick={() => setShowPowerMode(true)}
            >
              🔵 Power Mode
            </button>
            <button 
              className={`system-tab ${!showPowerMode ? 'active' : ''}`}
              onClick={() => setShowPowerMode(false)}
            >
              ⚫ Shadow Mode
            </button>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {showPowerMode ? (
            <motion.div key="power" {...fadeIn} className="p-4 rounded-lg" style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.3)' }}>
              <h4 className="font-semibold mb-3 text-cosmic-cyan">🔵 Power Mode You:</h4>
              <ul className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {arch.powerMode.map((p: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span style={{ color: 'var(--cosmic-cyan)' }}>⚡</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Power Mode is your natural state — you just slip out of it when chaos or emotional noise gets too loud.
              </p>
            </motion.div>
          ) : (
            <motion.div key="shadow" {...fadeIn} className="p-4 rounded-lg" style={{ background: 'rgba(100, 100, 100, 0.1)', border: '1px solid rgba(100, 100, 100, 0.3)' }}>
              <h4 className="font-semibold mb-3" style={{ color: '#888' }}>⚫ Shadow Mode You:</h4>
              <ul className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {arch.shadowMode.map((s: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <span>○</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                When you're in Shadow Mode, awareness is the first step back to Power Mode.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
      
      {/* Destiny Reading */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="zodiac-icon" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>🌟</div>
          <h3 className="card-title">Destiny Reading — The Builder of Legacy</h3>
        </div>
        
        <p className="text-muted-foreground mb-6">Your path is not random — it follows a pattern:</p>
        
        <div className="grid gap-4">
          {[
            { phase: 'Phase 1: Fire & Lessons', age: '0–25', desc: 'Learning through pain, betrayal, chaos, mistakes, and broken trust. But every wound taught you a skill, a boundary, or a strength.', color: '#ef4444' },
            { phase: 'Phase 2: Construction Era', age: '25–40', desc: 'You start building: projects, apps, sagas, systems, creative universes, new identities for yourself. This is where the Architect shows up.', color: '#f59e0b' },
            { phase: 'Phase 3: Rise Into Leadership', age: '40–55', desc: "You become the mentor, the master builder, the quiet leader people look to. You guide, create, protect, and shape the future. You'll be known for something by this stage.", color: '#22d3ee' },
            { phase: 'Phase 4: Legacy Era', age: '55+', desc: 'What you built becomes your mark. Your kids, your art, your game universes, your apps — they outlive you.', color: '#a78bfa' }
          ].map((p, i) => (
            <div key={i} className="p-4 rounded-lg" style={{ borderLeft: `4px solid ${p.color}`, background: 'var(--muted)' }}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold" style={{ color: p.color }}>{p.phase}</h4>
                <span className="system-badge">{p.age}</span>
              </div>
              <p className="text-muted-foreground text-sm">{p.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>
            <span className="gradient-text-gold">Your destiny is to leave something behind.</span>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ELEMENTAL MEDICINE SECTION
// ═══════════════════════════════════════════════════════════════════════════

function ElementalMedicineSection({ profile }: { profile: any }) {
  const numData = profile.numerologyData;
  const astro = profile.astrologyData;
  const hdData = profile.humanDesignData;
  
  // Calculate elemental profile (simplified client-side version)
  const lifePath = numData?.lifePath || 7;
  const sunSign = astro?.sunSign;
  const moonSign = astro?.moonSign;
  
  // Element scoring
  const scores: Record<string, number> = { Earth: 20, Water: 20, Fire: 20, Air: 20, Metal: 20 };
  
  // Sun sign element
  const signElements: Record<string, string> = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
  };
  
  if (sunSign && signElements[sunSign]) scores[signElements[sunSign]] += 20;
  if (moonSign && signElements[moonSign]) scores[signElements[moonSign]] += 15;
  
  // Life path influence
  if ([2, 4, 6].includes(lifePath)) scores.Earth += 15;
  if ([7, 9, 11].includes(lifePath)) scores.Water += 15;
  if ([1, 3, 5].includes(lifePath)) scores.Fire += 15;
  if ([8, 22].includes(lifePath)) scores.Metal += 15;
  
  // Sort to find primary/secondary
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryElement = sorted[0][0];
  const secondaryElement = sorted[1][0];
  const deficientElement = sorted[4][0];
  
  const elementData: Record<string, any> = {
    Earth: { symbol: '🌍', color: '#8B7355', balanced: ['Grounded', 'Steady', 'Nurturing', 'Practical'], imbalanced: ['Overwhelm', 'Worry', 'Stagnation'], helps: ['Warm meals', 'Consistent schedule', 'Nature walks', 'Strength training'], avoid: ['Skipping meals', 'Chaos', 'Irregular sleep'] },
    Water: { symbol: '💧', color: '#4A90D9', balanced: ['Calm', 'Intuitive', 'Empathetic', 'Wise'], imbalanced: ['Anxiety', 'Exhaustion', 'Fear'], helps: ['Hydration', 'Baths', 'Journaling', 'Rest'], avoid: ['Noise', 'Emotional vampires', 'Overwork'] },
    Fire: { symbol: '🔥', color: '#E85D4C', balanced: ['Motivated', 'Passionate', 'Warm', 'Leader'], imbalanced: ['Anger', 'Burnout', 'Insomnia'], helps: ['Exercise', 'Morning sun', 'Cooling foods', 'Creative outlets'], avoid: ['Late nights', 'Stimulants', 'Conflict'] },
    Air: { symbol: '🌬️', color: '#87CEEB', balanced: ['Clear-minded', 'Communicative', 'Adaptable', 'Inspired'], imbalanced: ['Overthinking', 'Restless', 'Scattered'], helps: ['Breathwork', 'Media limits', 'Walking', 'Single-tasking'], avoid: ['Multitasking', 'Info overload', 'Chaos'] },
    Metal: { symbol: '⚔️', color: '#C0C0C0', balanced: ['Disciplined', 'Clear boundaries', 'Organized', 'Strong integrity'], imbalanced: ['Rigidity', 'Grief', 'Perfectionism'], helps: ['Schedules', 'Saying no', 'Decluttering', 'Strength training'], avoid: ['People-pleasing', 'Clutter', 'Broken promises'] }
  };
  
  const primary = elementData[primaryElement];
  const secondary = elementData[secondaryElement];
  const deficient = elementData[deficientElement];
  
  // Daily element based on day of week
  const dayOfWeek = new Date().getDay();
  const dailyElements = ['Earth', 'Air', 'Fire', 'Water', 'Metal', 'Earth', 'Water'];
  const todayElement = dailyElements[dayOfWeek];
  const todayData = elementData[todayElement];
  
  const dailyGuidance: Record<string, { focus: string; action: string; affirmation: string }> = {
    Earth: { focus: 'Grounding & Structure', action: 'Complete one task fully. Eat a nourishing meal. Touch the ground.', affirmation: 'I am grounded. I am stable. I am enough.' },
    Water: { focus: 'Rest & Emotion', action: 'Journal your feelings. Take a bath. Listen to calming music.', affirmation: 'I flow with life. My emotions are wisdom.' },
    Fire: { focus: 'Action & Purpose', action: 'Move your body. Start a project. Express your passion.', affirmation: 'I am the fire. I create. I transform.' },
    Air: { focus: 'Clarity & Communication', action: 'Breathe deeply. Write your thoughts. Speak your truth.', affirmation: 'My mind is clear. My voice matters.' },
    Metal: { focus: 'Boundaries & Order', action: 'Say no to one thing. Organize something. Honor your limits.', affirmation: 'I protect my energy. I honor my boundaries.' }
  };
  
  const today = dailyGuidance[todayElement];

  return (
    <div className="grid gap-6">
      {/* Primary Element */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="zodiac-icon" style={{ width: '5rem', height: '5rem', fontSize: '2.5rem', background: `linear-gradient(135deg, ${primary.color} 0%, var(--cosmic-purple) 100%)` }}>
            {primary.symbol}
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Your Primary Element</p>
            <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700 }}>{primaryElement}</h2>
          </div>
        </div>
        
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <h4 className="font-semibold mb-2 text-cosmic-cyan">When Balanced:</h4>
            <div className="flex flex-wrap gap-2">
              {primary.balanced.map((b: string, i: number) => (
                <span key={i} className="system-badge">{b}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-cosmic-pink">When Imbalanced:</h4>
            <div className="flex flex-wrap gap-2">
              {primary.imbalanced.map((b: string, i: number) => (
                <span key={i} className="system-badge" style={{ borderColor: 'var(--cosmic-pink)' }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
      
      {/* Element Scores */}
      <GlassCard className="p-6">
        <h3 className="card-title mb-4">Elemental Constitution</h3>
        <div className="grid gap-3">
          {sorted.map(([element, score], i) => (
            <div key={element}>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <span>{elementData[element].symbol}</span>
                  <span>{element}</span>
                  {i === 0 && <span className="text-cosmic-purple text-xs">(Primary)</span>}
                  {i === 1 && <span className="text-cosmic-lavender text-xs">(Secondary)</span>}
                  {i === 4 && <span className="text-cosmic-pink text-xs">(Needs attention)</span>}
                </span>
                <span>{Math.round((score / 100) * 100)}%</span>
              </div>
              <div className="h-3 rounded-full" style={{ background: 'var(--muted)' }}>
                <motion.div 
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(score, 100)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  style={{ background: elementData[element].color }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
      
      {/* Daily Elemental Guidance */}
      <GlassCard className="p-6" style={{ border: `2px solid ${todayData.color}` }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="zodiac-icon" style={{ background: todayData.color }}>{todayData.symbol}</div>
          <div>
            <p className="text-muted-foreground text-sm">Today's Elemental Focus</p>
            <h3 className="card-title">{todayElement}: {today.focus}</h3>
          </div>
        </div>
        
        <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--muted)' }}>
          <h4 className="font-semibold mb-2">Today's Action:</h4>
          <p className="text-muted-foreground">{today.action}</p>
        </div>
        
        <div className="p-4 rounded-lg text-center" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%)' }}>
          <p style={{ fontStyle: 'italic', color: 'var(--cosmic-lavender)' }}>
            "{today.affirmation}"
          </p>
        </div>
      </GlassCard>
      
      {/* Remedies */}
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <GlassCard className="p-6">
          <h3 className="card-title mb-4">✅ What Helps You</h3>
          <ul className="flex flex-col gap-2">
            {primary.helps.map((h: string, i: number) => (
              <li key={i} className="flex items-center gap-2">
                <span style={{ color: 'var(--cosmic-cyan)' }}>+</span>
                <span className="text-muted-foreground">{h}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
        
        <GlassCard className="p-6">
          <h3 className="card-title mb-4">⚠️ What to Avoid</h3>
          <ul className="flex flex-col gap-2">
            {primary.avoid.map((a: string, i: number) => (
              <li key={i} className="flex items-center gap-2">
                <span style={{ color: 'var(--cosmic-pink)' }}>−</span>
                <span className="text-muted-foreground">{a}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
      
      {/* Strengthen Deficient Element */}
      <GlassCard className="p-6" style={{ borderColor: 'var(--cosmic-gold)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="zodiac-icon" style={{ background: deficient.color }}>{deficient.symbol}</div>
          <div>
            <p className="text-muted-foreground text-sm">Element to Strengthen</p>
            <h3 className="card-title">{deficientElement}</h3>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Your {deficientElement} element could use attention. Here's how to cultivate it:
        </p>
        
        <div className="flex flex-wrap gap-2">
          {deficient.helps.map((h: string, i: number) => (
            <span key={i} className="system-badge" style={{ background: 'var(--secondary)' }}>
              {h}
            </span>
          ))}
        </div>
      </GlassCard>
      
      {/* Weekly Rhythm */}
      <GlassCard className="p-6">
        <h3 className="card-title mb-4">📅 Weekly Elemental Rhythm</h3>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const el = ['Earth', 'Fire', 'Air', 'Water', 'Metal', 'Fire', 'Water'][i];
            const isToday = i === (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
            return (
              <div 
                key={day} 
                className="text-center p-3 rounded-lg"
                style={{ 
                  background: isToday ? elementData[el].color : 'var(--muted)',
                  color: isToday ? 'white' : 'var(--muted-foreground)'
                }}
              >
                <div className="text-xs">{day}</div>
                <div style={{ fontSize: '1.5rem' }}>{elementData[el].symbol}</div>
                <div className="text-xs">{el}</div>
              </div>
            );
          })}
        </div>
      </GlassCard>
      
      {/* Disclaimer */}
      <div className="text-center text-muted-foreground text-sm p-4" style={{ opacity: 0.7 }}>
        <p>Soul Codex Elemental Insights are for personal reflection and wellness education.</p>
        <p>They do not diagnose or treat medical conditions. Always consult a licensed professional for medical concerns.</p>
      </div>
    </div>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <GlassCard className="p-8 text-center">
      <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🌑</div>
      <p className="text-muted-foreground">{message}</p>
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGES - Daily Insights
// ═══════════════════════════════════════════════════════════════════════════

function DailyInsightsPage() {
  const { profiles } = useApp();
  const profile = profiles?.[0];
  const { data: insights, isLoading } = useDailyInsights(profile?.id);

  if (!profile) {
    return (
      <div className="container p-8 text-center">
        <GlassCard className="p-8">
          <p>Create a profile to see your daily insights.</p>
          <Link href="/create">
            <Button variant="glow" className="mt-4">Create Profile</Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingOrb text="Reading the cosmic currents..." />;
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="container" style={{ maxWidth: 900, padding: '2rem 1rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <h1 className="gradient-text mb-2">Daily Cosmic Insights</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>

        <div className="grid gap-6">
          {/* Current Energy */}
          {insights?.currentEnergy && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="zodiac-icon">⚡</div>
                <h3 className="card-title">Today's Energy</h3>
              </div>
              <p className="text-muted-foreground" style={{ lineHeight: 1.8 }}>
                {insights.currentEnergy}
              </p>
            </GlassCard>
          )}

          {/* Affirmations */}
          {insights?.affirmations?.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="zodiac-icon">🌟</div>
                <h3 className="card-title">Today's Affirmations</h3>
              </div>
              <div className="flex flex-col gap-3">
                {insights.affirmations.map((aff: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg" style={{ background: 'var(--secondary)' }}>
                    <p className="text-cosmic-lavender font-medium">"{typeof aff === 'string' ? aff : aff.text}"</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Reflection Prompts */}
          {insights?.reflectionPrompts?.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="zodiac-icon">💭</div>
                <h3 className="card-title">Reflection Prompts</h3>
              </div>
              <div className="flex flex-col gap-3">
                {insights.reflectionPrompts.map((prompt: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-cosmic-pink">{i + 1}.</span>
                    <p className="text-muted-foreground">{prompt}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Cosmic Weather */}
          {(insights?.moonPhase || insights?.moonSign) && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="zodiac-icon">🌙</div>
                <h3 className="card-title">Cosmic Weather</h3>
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                {insights.moonPhase && (
                  <div className="text-center p-4 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <div style={{ fontSize: '2rem' }}>🌙</div>
                    <div className="font-semibold">{insights.moonPhase}</div>
                    <div className="text-muted-foreground text-sm">Moon Phase</div>
                  </div>
                )}
                {insights.moonSign && (
                  <div className="text-center p-4 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <div style={{ fontSize: '2rem' }}>{ZodiacIcons[insights.moonSign] || "🌙"}</div>
                    <div className="font-semibold">{insights.moonSign}</div>
                    <div className="text-muted-foreground text-sm">Moon Sign</div>
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGES - Compatibility
// ═══════════════════════════════════════════════════════════════════════════

function CompatibilityPage() {
  const { profiles } = useApp();
  const [, navigate] = useLocation();
  const profile = profiles?.[0];

  if (!profile) {
    return (
      <div className="container p-8 text-center">
        <GlassCard className="p-8">
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>💕</div>
          <h2 className="mb-4">Compatibility Analysis</h2>
          <p className="text-muted-foreground mb-6">
            Create your profile first to analyze compatibility with others.
          </p>
          <Button variant="glow" onClick={() => navigate('/create')}>
            <Icons.Sparkles /> Create Your Profile
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 900, padding: '2rem 1rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <h1 className="gradient-text mb-2">Compatibility Analysis</h1>
          <p className="text-muted-foreground">
            Discover the cosmic connections between you and others
          </p>
        </div>

        <GlassCard className="p-8 text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>💜</div>
          <h3 className="mb-4">Add People to Compare</h3>
          <p className="text-muted-foreground mb-6">
            Add a partner, friend, family member, or colleague to see your compatibility across all 30+ systems.
          </p>
          <Button variant="glow">
            <Icons.Plus /> Add Person
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGES - Auth
// ═══════════════════════════════════════════════════════════════════════════

function LoginPage() {
  const [, navigate] = useLocation();
  const login = useLogin();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSignup, setIsSignup] = useState(false);
  const signup = useSignup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await signup.mutateAsync(form);
      } else {
        await login.mutateAsync(form);
      }
      navigate('/dashboard');
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const mutation = isSignup ? signup : login;

  return (
    <div className="container" style={{ maxWidth: 400, padding: '4rem 1rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔮</div>
          <h1 className="gradient-text mb-2">{isSignup ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-muted-foreground">
            {isSignup ? "Begin your cosmic journey" : "Continue your soul exploration"}
          </p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            
            <Button type="submit" variant="glow" disabled={mutation.isPending} className="mt-2">
              {mutation.isPending ? "Loading..." : isSignup ? "Create Account" : "Sign In"}
            </Button>
          </form>

          {mutation.isError && (
            <p className="text-center mt-4" style={{ color: 'var(--destructive)' }}>
              {(mutation.error as Error)?.message || "Authentication failed"}
            </p>
          )}

          <div className="text-center mt-6">
            <button
              type="button"
              className="text-cosmic-lavender hover:underline"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </GlassCard>

        <div className="text-center mt-6">
          <Link href="/create" className="text-muted-foreground hover:text-foreground">
            Or continue without an account →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI CHAT - Soul Guide
// ═══════════════════════════════════════════════════════════════════════════

function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: "Hello, seeker. I am your Soul Guide. Ask me anything about your cosmic blueprint, and I shall illuminate your path. ✨" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { profiles } = useApp();
  const profile = profiles?.[0];

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          profileId: profile?.id 
        }),
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || data.message || "The cosmos remains silent for now..." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "The cosmic connection was interrupted. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        className="chat-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <Icons.Close /> : "🔮"}
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-modal"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="chat-header">
              <span className="chat-title">
                <span>🔮</span> Soul Guide
              </span>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer' }}>
                <Icons.Close />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`chat-message ${msg.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {msg.content}
                </motion.div>
              ))}
              {isLoading && (
                <div className="chat-message assistant" style={{ opacity: 0.7 }}>
                  ✨ Consulting the cosmos...
                </div>
              )}
            </div>

            <div className="chat-input-container">
              <input
                className="chat-input"
                placeholder="Ask your Soul Guide..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
              />
              <button className="chat-send" onClick={sendMessage} disabled={isLoading}>
                <Icons.Send />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGES - Profile by ID (Route)
// ═══════════════════════════════════════════════════════════════════════════

function ProfilePage({ params }: { params: { id: string } }) {
  return <ProfileView profileId={params.id} />;
}

// ═══════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════════════

function AppContent() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: profiles = [], isLoading: profilesLoading, refetch } = useProfiles();

  const isLoading = userLoading || profilesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingOrb text="Aligning the cosmic energies..." />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ 
      user, 
      isLoading, 
      profile: profiles?.[0], 
      profiles: profiles || [],
      refetch 
    }}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1">
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/create" component={CreateProfilePage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/profile/:id" component={ProfilePage} />
            <Route path="/daily" component={DailyInsightsPage} />
            <Route path="/compatibility" component={CompatibilityPage} />
            <Route path="/login" component={LoginPage} />
            <Route>
              <div className="container p-8 text-center">
                <h1 className="gradient-text mb-4">Page Not Found</h1>
                <Link href="/">
                  <Button variant="secondary">Return Home</Button>
                </Link>
              </div>
            </Route>
          </Switch>
        </main>

        <Footer />
        <AIChatButton />
      </div>
    </AppContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

// Mount the app
const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
