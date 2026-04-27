import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CosmicBackground } from "./CosmicBackground";

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Extended timing to ensure readability
    const timers = [
      setTimeout(() => setStage(1), 2500), // Master brand shows for 2.5s
      setTimeout(() => onComplete(), 5500), // Total splash duration 5.5s
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0D0B1A] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <CosmicBackground />
      </div>

      {/* Sacred Geometry: Circular Orbit Seal */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none z-10">
        <div className="relative w-[80vh] h-[80vh] border border-[#FFD700] rounded-full">
          <div className="absolute inset-[10%] border border-[#FFD700] rounded-full" />
          <div className="absolute inset-[25%] border border-[#FFD700] rounded-full" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[#FFD700]" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#FFD700]" />
        </div>
      </div>

      {/* Text Isolation Layer: Stronger dark glow behind the content for contrast */}
      <div className="absolute inset-0 z-[5] pointer-events-none" style={{
        background: "radial-gradient(circle at 50% 50%, rgba(13,11,26,0.95) 0%, rgba(13,11,26,0.6) 35%, rgba(13,11,26,0) 70%)"
      }} />

      {/* Background Depth: Purple Nebula Flash */}
      <motion.div 
        className="absolute inset-0 z-[1] mix-blend-screen pointer-events-none"
        initial={{ background: "radial-gradient(circle at 50% 50%, rgba(157,78,221,0.8) 0%, rgba(13,11,26,0) 80%)" }}
        animate={{ background: "radial-gradient(circle at 50% 50%, rgba(26,11,46,0) 0%, rgba(13,11,26,0) 100%)" }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="master-brand"
            exit={{ opacity: 0, filter: "blur(20px)", scale: 2 }}
            className="z-10 flex flex-col items-center justify-center w-full px-4 relative"
          >
            {/* Extreme Flare Behind Emblem */}
            <motion.div 
              className="absolute inset-0 bg-[#9D4EDD] rounded-full pointer-events-none z-0 mix-blend-screen"
              style={{ filter: "blur(80px)" }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.7, 0], scale: [0, 2.5, 5] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* Geometric Studio Emblem - explosive slam entry */}
            <motion.div
              className="relative w-28 h-28 md:w-36 md:h-36 mb-8 z-10"
              initial={{ scale: 5, opacity: 0, rotate: 180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 12, mass: 0.8 }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_30px_rgba(255,215,0,0.9)]">
                {/* Outer Diamond Path */}
                <motion.path 
                  d="M50 2 L98 50 L50 98 L2 50 Z" 
                  fill="none" 
                  stroke="#FFD700" 
                  strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                {/* Inner Rotating Dashed Circle */}
                <motion.circle 
                  cx="50" cy="50" r="28" 
                  fill="none" 
                  stroke="#FFD700" 
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "center" }}
                />
                {/* Central Glowing Core */}
                <motion.circle 
                  cx="50" cy="50" r="6" 
                  fill="#FFD700" 
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 2.5, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>
            </motion.div>
            
            <motion.span 
              initial={{ filter: "blur(20px)", letterSpacing: "1em", opacity: 0, y: 50 }}
              animate={{ filter: "blur(0px)", letterSpacing: "0.4em", opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.1 }}
              className="font-serif text-[#FFD700] text-sm md:text-lg uppercase font-bold text-center z-10"
              style={{ textShadow: "0 4px 20px rgba(0,0,0,1), 0 0 40px rgba(255,215,0,0.8)" }}
            >
              Bobby’s World Presents
            </motion.span>
          </motion.div>
        )}
 
        {stage === 1 && (
          <motion.div
            key="app-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.5 }}
            transition={{ duration: 0.2 }}
            className="z-10 flex flex-col items-center gap-6 w-full px-4 relative"
          >
            {/* Massive Starburst Background Flare */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-[#9D4EDD] rounded-full pointer-events-none mix-blend-screen z-0"
              style={{ filter: "blur(100px)" }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 0.6, 0.2] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* Central Signal Mark */}
            <motion.div 
              className="relative mb-4 z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="w-16 h-16 border-2 border-[#FFD700] rounded-full flex items-center justify-center bg-[#0D0B1A]/80 shadow-[0_0_30px_rgba(255,215,0,0.4)]">
                <div className="w-3 h-3 bg-[#FFD700] rounded-full shadow-[0_0_25px_#FFD700]" />
              </div>
              <div className="absolute inset-0 border-2 border-[#FFD700] rounded-full animate-ping" />
            </motion.div>
            
            <div className="text-center w-full z-10">
              <motion.h1 
                className="font-serif text-4xl sm:text-6xl md:text-8xl text-[#FFD700] uppercase font-black mb-2 whitespace-nowrap"
                style={{ textShadow: "0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.5), 0 0 100px rgba(255,215,0,0.3)" }}
                initial={{ letterSpacing: "0.8em", opacity: 0, scale: 0.5, filter: "blur(20px)" }}
                animate={{ letterSpacing: "0.15em", opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 120, damping: 12 }}
              >
                Soul Codex
              </motion.h1>
              <motion.p 
                className="text-[#F2F2F2] font-serif italic text-[11px] sm:text-sm md:text-base uppercase font-bold"
                style={{ textShadow: "0 4px 15px rgba(0,0,0,1), 0 0 20px rgba(255,215,0,0.6)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.9, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Decode the patterns
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplashScreen;
