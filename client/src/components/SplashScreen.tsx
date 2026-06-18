import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { IconLogo, IconSparkles } from "./Icons";

const goldPinkText: React.CSSProperties = {
  background: "linear-gradient(135deg, #f6d3ad 0%, #e7b78f 30%, #f0a8d2 64%, #d9a6df 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "#e6b995",
};

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 2600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(13,6,16,0.00) 0%, rgba(13,6,16,0.14) 58%, rgba(8,4,10,0.38) 100%), url('/src/assets/soulcodex-nebula-hero.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#100713",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 110% 28% at 18% 0%, rgba(247,219,228,0.58) 0%, rgba(220,165,229,0.38) 34%, transparent 76%), radial-gradient(ellipse 70% 26% at 90% 4%, rgba(156,79,194,0.48) 0%, transparent 78%), radial-gradient(ellipse 64% 32% at 50% 92%, rgba(226,181,221,0.36) 0%, rgba(94,42,126,0.32) 52%, transparent 82%)",
          filter: "blur(9px)",
          opacity: 0.96,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(229,182,140,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(229,182,140,0.065) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          opacity: 0.28,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(232,185,149,0.30) 0%, rgba(240,168,210,0.16) 32%, transparent 66%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex h-full w-full flex-col items-center justify-between px-5 py-14 text-center"
      >
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="flex flex-col items-center gap-3"
        >
          <span
            style={{
              ...goldPinkText,
              fontSize: "0.72rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              fontWeight: 800,
            }}
          >
            Soul Codex
          </span>
          <div style={{ height: 1, width: 82, background: "linear-gradient(90deg, transparent, rgba(230,185,149,0.82), rgba(240,168,210,0.70), transparent)" }} />
        </motion.div>

        <div className="relative flex flex-col items-center">
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[27rem] w-[27rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[88px]"
            style={{ background: "radial-gradient(circle, rgba(217,155,117,0.30) 0%, rgba(240,168,210,0.18) 42%, transparent 72%)" }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.50, 0.72, 0.50] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ scale: 0.86, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.35, duration: 1, type: "spring", stiffness: 62 }}
            style={{ filter: "drop-shadow(0 0 34px rgba(230,185,149,0.76)) drop-shadow(0 0 76px rgba(240,168,210,0.30))" }}
          >
            <IconLogo size={132} />
          </motion.div>

          <motion.h1
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.75 }}
            className="font-display mt-7 text-center text-5xl leading-none sm:text-6xl md:text-7xl"
            style={{
              ...goldPinkText,
              letterSpacing: 0,
              textShadow: "0 0 28px rgba(230,185,149,0.42), 0 0 58px rgba(240,168,210,0.28)",
            }}
          >
            Soul<br />Codex
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.7 }}
            style={{
              marginTop: "1.35rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              border: "1px solid rgba(230,185,149,0.40)",
              borderRadius: 999,
              background: "rgba(41,16,48,0.44)",
              padding: "0.48rem 1rem",
              color: "rgba(246,226,231,0.80)",
              fontSize: "0.78rem",
              boxShadow: "0 10px 34px rgba(15,6,20,0.30)",
            }}
          >
            <IconSparkles size={14} style={{ color: "#f0a8d2" }} />
            <span>Opening your reading</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.78 }}
          transition={{ delay: 1.55, duration: 0.7 }}
          className="flex flex-col items-center gap-3"
        >
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                style={{ width: 8, height: 8, borderRadius: 999, background: i === 1 ? "#f0a8d2" : "#e6b995", boxShadow: "0 0 12px rgba(230,185,149,0.55)" }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.86, 1.08, 0.86] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.16 }}
              />
            ))}
          </div>
          <span style={{ color: "rgba(246,226,231,0.52)", fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Free to start · private · guided
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
