import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Restrained timing: 1 second max for the main sequence
    const timers = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => onComplete(), 1200), // Slightly over 1s for a smooth transition
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0D0B1A] overflow-hidden">
      {/* Sacred Geometry: Circular Orbit Seal */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <div className="relative w-[80vh] h-[80vh] border border-[#FFD700] rounded-full">
          <div className="absolute inset-[10%] border border-[#FFD700] rounded-full" />
          <div className="absolute inset-[25%] border border-[#FFD700] rounded-full" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[#FFD700]" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#FFD700]" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="master-brand"
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="z-10 text-center"
          >
            <span className="font-serif text-[#F2F2F2] text-xs md:text-sm uppercase tracking-[0.4em] font-light">
              Bobby’s World Presents
            </span>
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="app-title"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
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
              <h1 className="font-serif text-3xl md:text-4xl text-[#FFD700] tracking-[0.25em] uppercase font-medium mb-2">
                Soul Codex
              </h1>
              <p className="text-[#F2F2F2]/40 font-serif italic text-[10px] md:text-xs tracking-[0.3em] uppercase">
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
