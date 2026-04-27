import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Restrained timing: 1.5s total for a more deliberate studio-card feel
    const timers = [
      setTimeout(() => setStage(1), 700), // Master brand shows for 700ms
      setTimeout(() => onComplete(), 1800), // Total splash duration 1.8s
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0D0B1A] overflow-hidden">
      {/* Sacred Geometry: Circular Orbit Seal */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none">
        <div className="relative w-[80vh] h-[80vh] border border-[#FFD700] rounded-full">
          <div className="absolute inset-[10%] border border-[#FFD700] rounded-full" />
          <div className="absolute inset-[25%] border border-[#FFD700] rounded-full" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[#FFD700]" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#FFD700]" />
        </div>
      </div>

      {/* Text Isolation Layer: Subtle dark glow behind the content */}
      <div className="absolute inset-0 z-[5] pointer-events-none" style={{
        background: "radial-gradient(circle at 50% 50%, rgba(13,11,26,0.8) 0%, rgba(13,11,26,0) 60%)"
      }} />

      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="master-brand"
            initial={{ opacity: 0, filter: "blur(4px)", letterSpacing: "0.2em" }}
            animate={{ opacity: 1, filter: "blur(0px)", letterSpacing: "0.4em" }}
            exit={{ opacity: 0, filter: "blur(8px)", y: -10 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="z-10 text-center"
          >
            <span 
              className="font-serif text-[#F2F2F2] text-xs md:text-sm uppercase tracking-[0.4em] font-light"
              style={{ textShadow: "0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.4)" }}
            >
              Bobby’s World Presents
            </span>
          </motion.div>
        )}
 
        {stage === 1 && (
          <motion.div
            key="app-title"
            initial={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(4px)", scale: 1.02 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="z-10 flex flex-col items-center gap-4"
          >
            {/* Central Signal Mark */}
            <div className="relative mb-2">
              <div className="w-12 h-12 border border-[#FFD700]/30 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700]" />
              </div>
              <div className="absolute inset-0 border border-[#FFD700]/10 rounded-full animate-ping" />
            </div>
            
            <div className="text-center">
              <h1 
                className="font-serif text-3xl md:text-4xl text-[#FFD700] tracking-[0.25em] uppercase font-medium mb-2"
                style={{ textShadow: "0 0 25px rgba(0,0,0,0.9), 0 0 50px rgba(0,0,0,0.5)" }}
              >
                Soul Codex
              </h1>
              <p 
                className="text-[#F2F2F2]/40 font-serif italic text-[10px] md:text-xs tracking-[0.3em] uppercase"
                style={{ textShadow: "0 0 10px rgba(0,0,0,0.5)" }}
              >
                Decode the patterns
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Depth: Plum-Black */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, #1A0B2E 0%, #0D0B1A 100%)",
        }}
      />
    </div>
  );
};

export default SplashScreen;
