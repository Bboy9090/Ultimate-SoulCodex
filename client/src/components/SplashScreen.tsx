import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { IconLogo, IconSparkles } from "./Icons";

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
          "linear-gradient(180deg, rgba(13,6,16,0.06) 0%, rgba(13,6,16,0.26) 58%, rgba(8,4,10,0.54) 100%), url('/src/assets/soulcodex-nebula-hero.svg')",
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
          backgroundImage:
            "linear-gradient(to right, rgba(229,182,140,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(229,182,140,0.08) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          opacity: 0.36,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(232,185,149,0.24) 0%, rgba(169,95,158,0.14) 32%, transparent 66%)",
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
              color: "rgba(240,210,184,0.78)",
              fontSize: "0.68rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Soul Codex
          </span>
          <div style={{ height: 1, width: 72, background: "linear-gradient(90deg, transparent, rgba(230,185,149,0.72), transparent)" }} />
        </motion.div>

        <div className="relative flex flex-col items-center">
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
            style={{ background: "rgba(217,155,117,0.24)" }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.42, 0.62, 0.42] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ scale: 0.86, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.35, duration: 1, type: "spring", stiffness: 62 }}
            style={{ filter: "drop-shadow(0 0 34px rgba(230,185,149,0.72)) drop-shadow(0 0 76px rgba(169,95,158,0.34))" }}
          >
            <IconLogo size={132} />
          </motion.div>

          <motion.h1
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.75 }}
            className="font-display mt-7 text-center text-5xl leading-none sm:text-6xl md:text-7xl"
            style={{
              color: "#e6b995",
              letterSpacing: 0,
              textShadow: "0 0 28px rgba(230,185,149,0.42), 0 0 58px rgba(126,57,167,0.30)",
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
              border: "1px solid rgba(230,185,149,0.34)",
              borderRadius: 999,
              background: "rgba(41,16,48,0.42)",
              padding: "0.48rem 1rem",
              color: "rgba(246,226,231,0.76)",
              fontSize: "0.78rem",
            }}
          >
            <IconSparkles size={14} style={{ color: "#e6b995" }} />
            <span>Opening your reading</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.55, duration: 0.7 }}
          className="flex flex-col items-center gap-3"
        >
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                style={{ width: 8, height: 8, borderRadius: 999, background: "#e6b995", boxShadow: "0 0 12px rgba(230,185,149,0.55)" }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.86, 1.08, 0.86] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.16 }}
              />
            ))}
          </div>
          <span style={{ color: "rgba(246,226,231,0.48)", fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Free to start · private · guided
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
