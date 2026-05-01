import React, { useEffect, useState } from 'react';
import { motion, useTransform, useSpring } from 'framer-motion';

export const CosmicBackground: React.FC = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      setTilt({
        x: (e.clientX / window.innerWidth - 0.5) * 50,
        y: (e.clientY / window.innerHeight - 0.5) * 50,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const springX = useSpring(tilt.x, { stiffness: 35, damping: 20 });
  const springY = useSpring(tilt.y, { stiffness: 35, damping: 20 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] bg-[#030208]">
      {/* ── Deep Foundation ── */}
      <div className="absolute inset-0 bg-[#030208]" />
      
      {/* ── High-Contrast Nebula Core (Thick Clouds) ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.15),
          y: useTransform(springY, (val) => val * 0.15),
          scale: 1.1
        }}
        className="absolute inset-[-10%] opacity-80 mix-blend-screen"
      >
        {/* Intense Indigo/Violet Core */}
        <div className="absolute top-[5%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_#1A0B2E_0%,_transparent_70%)] blur-[120px]" />
      </motion.div>

      {/* ── Electric Nebula Clouds ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * -0.4),
          y: useTransform(springY, (val) => val * -0.4),
        }}
        className="absolute inset-[-20%] opacity-95 mix-blend-color-dodge"
      >
        {/* Bright Violet Cloud Top Right */}
        <div className="absolute top-[10%] right-[5%] w-[70%] h-[70%] bg-[radial-gradient(circle,_#7C3AED_45%,_transparent_70%)] blur-[100px] animate-nebula-drift" />
        {/* Deep Purple Cloud Bottom Left */}
        <div className="absolute bottom-[5%] left-[5%] w-[80%] h-[80%] bg-[radial-gradient(circle,_#4C1D95_35%,_transparent_70%)] blur-[130px] animate-nebula-drift-reverse" />
      </motion.div>

      {/* ── Magenta Accents (High Fidelity) ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.7),
          y: useTransform(springY, (val) => val * 0.7),
        }}
        className="absolute inset-[-15%] opacity-80 mix-blend-screen"
      >
        <div className="absolute top-[35%] left-[25%] w-[55%] h-[55%] bg-[radial-gradient(circle,_#DB2777_25%,_transparent_65%)] blur-[90px] animate-pulse-slow" />
        <div className="absolute bottom-[25%] right-[20%] w-[60%] h-[60%] bg-[radial-gradient(circle,_#9333EA_30%,_transparent_60%)] blur-[110px]" />
      </motion.div>

      {/* ── Sacred Geometry Grid (Geometric Overlay) ── */}
      <motion.div 
        style={{
          x: useTransform(springX, (val) => val * 0.05),
          y: useTransform(springY, (val) => val * 0.05),
        }}
        className="absolute inset-0 opacity-[0.2] mix-blend-overlay"
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(242, 201, 76, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(242, 201, 76, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(212, 168, 95, 0.2) 2px, transparent 2px),
            linear-gradient(90deg, rgba(212, 168, 95, 0.2) 2px, transparent 2px)
          `,
          backgroundSize: '240px 240px'
        }} />
      </motion.div>

      {/* ── High-Fidelity Starfield (3 Layers) ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 2),
          y: useTransform(springY, (val) => val * 2),
        }}
        className="absolute inset-[-10%] z-10"
      >
        <div className="starfield-layer stars-bright animate-twinkle-fast" />
      </motion.div>

      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 1.2),
          y: useTransform(springY, (val) => val * 1.2),
        }}
        className="absolute inset-[-5%] z-[9] opacity-70"
      >
        <div className="starfield-layer stars-medium" />
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nebula-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4%, 3%) scale(1.1); }
        }
        @keyframes nebula-drift-reverse {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(-3%, -2%) scale(1); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes twinkle-fast {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-nebula-drift { animation: nebula-drift 30s infinite ease-in-out; }
        .animate-nebula-drift-reverse { animation: nebula-drift-reverse 40s infinite ease-in-out; }
        .animate-pulse-slow { animation: pulse-slow 15s infinite ease-in-out; }
        .animate-twinkle-fast { animation: twinkle-fast 5s infinite ease-in-out; }

        .starfield-layer {
          position: absolute;
          inset: 0;
          background-repeat: repeat;
          background-size: 100% 100%;
        }
        .stars-bright {
          background-image: 
            radial-gradient(2px 2px at 15% 15%, #fff, transparent),
            radial-gradient(2px 2px at 85% 85%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 50% 10%, #fff, transparent),
            radial-gradient(2px 2px at 10% 90%, #fff, transparent),
            radial-gradient(3px 3px at 75% 25%, #FFD700, transparent);
          filter: drop-shadow(0 0 8px rgba(255,255,255,0.8));
        }
        .stars-medium {
          background-image: 
            radial-gradient(1.2px 1.2px at 25% 35%, #fff, transparent),
            radial-gradient(1.2px 1.2px at 65% 75%, #fff, transparent),
            radial-gradient(1.2px 1.2px at 10% 45%, #fff, transparent),
            radial-gradient(1.2px 1.2px at 90% 15%, #fff, transparent),
            radial-gradient(1.2px 1.2px at 5% 5%, #fff, transparent),
            radial-gradient(1.2px 1.2px at 95% 95%, #fff, transparent),
            radial-gradient(1.2px 1.2px at 50% 50%, #fff, transparent),
            radial-gradient(1.2px 1.2px at 30% 20%, #fff, transparent),
            radial-gradient(1.2px 1.2px at 70% 80%, #fff, transparent);
        }
      `}} />
    </div>
  );
};
