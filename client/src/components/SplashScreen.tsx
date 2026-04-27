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

      {/* Text Isolation Layer: Stronger dark glow behind the content for contrast */}
      <div className="absolute inset-0 z-[5] pointer-events-none" style={{
        background: "radial-gradient(circle at 50% 50%, rgba(13,11,26,0.95) 0%, rgba(13,11,26,0.6) 35%, rgba(13,11,26,0) 70%)"
      }} />

      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="master-brand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="z-10 flex flex-col items-center justify-center w-full px-4"
          >
            {/* The people and vehicle - spanning in zoom */}
            <motion.img 
              src="/images/bobbys-world-master.png"
              alt="Bobby's World"
              className="w-48 h-48 md:w-64 md:h-64 object-contain mb-4 drop-shadow-[0_0_30px_rgba(255,215,0,0.2)]"
              initial={{ scale: 0.3 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            
            <motion.span 
              initial={{ filter: "blur(4px)", letterSpacing: "0.1em" }}
              animate={{ filter: "blur(0px)", letterSpacing: "0.2em" }} // smaller tracking for mobile
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="font-serif text-[#F2F2F2] text-[10px] md:text-sm uppercase md:tracking-[0.4em] font-light text-center"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,0.8)" }}
            >
              Bobby’s World Presents
            </motion.span>
          </motion.div>
        )}
 
        {stage === 1 && (
          <motion.div
            key="app-title"
            initial={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(4px)", scale: 1.02 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="z-10 flex flex-col items-center gap-4 w-full px-4"
          >
            {/* Central Signal Mark */}
            <div className="relative mb-2">
              <div className="w-12 h-12 border border-[#FFD700]/30 rounded-full flex items-center justify-center bg-[#0D0B1A]/80 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full shadow-[0_0_15px_#FFD700]" />
              </div>
              <div className="absolute inset-0 border border-[#FFD700]/10 rounded-full animate-ping" />
            </div>
            
            <div className="text-center w-full">
              <h1 
                className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#FFD700] tracking-[0.15em] sm:tracking-[0.25em] uppercase font-medium mb-2 whitespace-nowrap"
                style={{ textShadow: "0 4px 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.8), 0 0 60px rgba(255,215,0,0.2)" }}
              >
                Soul Codex
              </h1>
              <p 
                className="text-[#F2F2F2]/60 font-serif italic text-[9px] sm:text-[10px] md:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,1)" }}
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
