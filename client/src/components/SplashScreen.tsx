import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CosmicBackground } from "./CosmicBackground";

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#080415] overflow-hidden">
      {/* Background Layer: High-Fidelity Cosmic Depth */}
      <div className="absolute inset-0 z-0">
        <CosmicBackground />
      </div>

      {/* Atmospheric Glow: Pink/Purple Wash */}
      <div className="absolute inset-0 z-[5] pointer-events-none" style={{
        background: "radial-gradient(circle at 50% 50%, rgba(123, 97, 255, 0.15) 0%, rgba(255, 0, 255, 0.1) 40%, transparent 80%)",
        mixBlendMode: "screen"
      }} />

      {/* Main Content Container */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative z-10 flex flex-col items-center justify-between h-full py-16 px-4 w-full"
      >
        {/* Top: Branding */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex flex-col items-center"
        >
          <span className="font-display text-[#E0B0FF] text-xs md:text-sm tracking-[0.4em] uppercase font-bold opacity-80">
            Bobbysworld presents
          </span>
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#FF00FF] to-transparent mt-4 opacity-40" />
        </motion.div>

        {/* Center: Title (The mirror of the world) */}
        <div className="flex flex-col items-center relative">
          {/* Backglow for the title */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[40vh] bg-[#7B61FF] rounded-full opacity-20 blur-[100px] pointer-events-none"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.h1
            initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.8, duration: 1.2, type: "spring", stiffness: 50 }}
            className="font-display text-4xl sm:text-6xl md:text-8xl text-white uppercase font-black text-center leading-none"
            style={{ 
              letterSpacing: "-0.02em",
              textShadow: "0 0 30px rgba(255, 0, 255, 0.6), 0 0 60px rgba(123, 97, 255, 0.4)"
            }}
          >
            Ultimate <br />
            <span className="gradient-text">Soul Codex</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-6 font-serif italic text-white/60 text-sm md:text-lg tracking-widest uppercase"
          >
            The Visionary Mirror of the World
          </motion.p>
        </div>

        {/* Bottom: Credits (Fine Print) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 2, duration: 1 }}
          className="flex flex-col items-center"
        >
          <span className="font-sans text-[6px] md:text-[8px] text-white/40 tracking-[0.3em] uppercase text-center max-w-[280px]">
            Bobbysworld presents Ultimate Soul Codex created in bobbys workshop 2025 (squint to see it)
          </span>
        </motion.div>
      </motion.div>

      {/* Lens Flare Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle,_rgba(255,255,255,0.4)_0%,_transparent_70%)] blur-3xl rotate-45" />
      </div>
    </div>
  );
};

export default SplashScreen;
