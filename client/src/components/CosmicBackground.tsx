import React, { useEffect, useState } from 'react';
import { motion, useTransform, useSpring } from 'framer-motion';

export const CosmicBackground: React.FC = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      setTilt({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };

    let rafId: number;
    let lastUpdate = 0;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!e.beta || !e.gamma) return;
      
      const now = Date.now();
      if (now - lastUpdate < 32) return; // Cap at ~30fps for background tilt to save battery/CPU
      lastUpdate = now;

      rafId = requestAnimationFrame(() => {
        // beta: -180 to 180, gamma: -90 to 90
        // We normalize for a natural holding position (~45 deg)
        const x = (e.gamma / 45) * 15; 
        const y = ((e.beta - 45) / 45) * 15; 
        setTilt({ x, y });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const springX = useSpring(tilt.x, { stiffness: 40, damping: 25 });
  const springY = useSpring(tilt.y, { stiffness: 40, damping: 25 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] bg-[#030208]">
      {/* ── Deep Foundation ── */}
      <div className="absolute inset-0 bg-[#030208]" />
      
      {/* ── Main Nebula Core: Deep Violet ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.2),
          y: useTransform(springY, (val) => val * 0.2),
          scale: 1.2
        }}
        className="absolute inset-[-20%] opacity-60 mix-blend-screen"
      >
        <div className="absolute top-[10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_#2D1155_0%,_transparent_70%)] blur-[100px]" />
      </motion.div>

      {/* ── Dynamic Nebula Clouds: Electric Purple ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * -0.5),
          y: useTransform(springY, (val) => val * -0.5),
        }}
        className="absolute inset-[-30%] opacity-50 mix-blend-screen"
      >
        <div className="absolute top-[20%] right-[10%] w-[80%] h-[80%] bg-[radial-gradient(circle,_#7C3AED_0%,_transparent_60%)] blur-[140px] animate-cloud-drift" />
        <div className="absolute bottom-[10%] left-[5%] w-[70%] h-[70%] bg-[radial-gradient(circle,_#5B21B6_0%,_transparent_60%)] blur-[120px] animate-cloud-drift-slow" />
      </motion.div>

      {/* ── Accent Nebula: Magenta/Indigo ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.8),
          y: useTransform(springY, (val) => val * 0.8),
        }}
        className="absolute inset-[-10%] opacity-40 mix-blend-color-dodge"
      >
        <div className="absolute top-[40%] left-[30%] w-[50%] h-[50%] bg-[radial-gradient(circle,_#DB2777_0%,_transparent_50%)] blur-[100px] animate-nebula-pulse" />
        <div className="absolute bottom-[30%] right-[20%] w-[60%] h-[60%] bg-[radial-gradient(circle,_#4338CA_0%,_transparent_55%)] blur-[110px]" />
      </motion.div>

      {/* ── Gold Stardust Veil ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * -1.2),
          y: useTransform(springY, (val) => val * -1.2),
        }}
        className="absolute inset-[-5%] opacity-20"
      >
        <div className="absolute top-[15%] left-[60%] w-full h-full bg-[radial-gradient(circle,_rgba(212,168,95,0.15)_0%,_transparent_40%)] blur-[80px]" />
      </motion.div>

      {/* ── High-Fidelity Starfield (3 Layers) ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 2.5),
          y: useTransform(springY, (val) => val * 2.5),
        }}
        className="absolute inset-[-15%] z-10"
      >
        <div className="starfield-dynamic stars-large animate-star-twinkle" />
      </motion.div>

      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 1.5),
          y: useTransform(springY, (val) => val * 1.5),
        }}
        className="absolute inset-[-10%] z-[9]"
      >
        <div className="starfield-dynamic stars-medium opacity-60" />
      </motion.div>

      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.6),
          y: useTransform(springY, (val) => val * 0.6),
        }}
        className="absolute inset-[-5%] z-[8]"
      >
        <div className="starfield-dynamic stars-small opacity-40" />
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cloud-drift {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(5%, 3%) scale(1.1); opacity: 0.7; }
        }
        @keyframes cloud-drift-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-3%, -2%) rotate(2deg); }
        }
        @keyframes nebula-pulse {
          0%, 100% { opacity: 0.3; filter: blur(100px); }
          50% { opacity: 0.6; filter: blur(80px); }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-cloud-drift { animation: cloud-drift 25s infinite ease-in-out; }
        .animate-cloud-drift-slow { animation: cloud-drift-slow 35s infinite ease-in-out; }
        .animate-nebula-pulse { animation: nebula-pulse 12s infinite ease-in-out; }
        .animate-star-twinkle { animation: star-twinkle 4s infinite ease-in-out; }

        .starfield-dynamic {
          position: absolute;
          inset: 0;
          background-repeat: repeat;
          background-size: 100% 100%;
        }
        .stars-large {
          background-image: 
            radial-gradient(2px 2px at 15% 15%, #fff, transparent),
            radial-gradient(2px 2px at 85% 85%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 50% 10%, #fff, transparent),
            radial-gradient(2px 2px at 10% 90%, #fff, transparent),
            radial-gradient(3px 3px at 75% 25%, #FFD700, transparent);
          filter: drop-shadow(0 0 5px rgba(255,255,255,0.5));
        }
        .stars-medium {
          background-image: 
            radial-gradient(1.5px 1.5px at 25% 35%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 65% 75%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 10% 45%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 90% 15%, #fff, transparent);
        }
        .stars-small {
          background-image: 
            radial-gradient(1px 1px at 5% 5%, #fff, transparent),
            radial-gradient(1px 1px at 95% 95%, #fff, transparent),
            radial-gradient(1px 1px at 50% 50%, #fff, transparent),
            radial-gradient(1px 1px at 30% 20%, #fff, transparent),
            radial-gradient(1px 1px at 70% 80%, #fff, transparent);
        }
      `}} />
    </div>
  );
};
