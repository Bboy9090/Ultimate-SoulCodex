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
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] bg-[#030208]" style={{ filter: 'contrast(1.1) brightness(1.1)' }}>
      {/* ── Deep Foundation ── */}
      <div className="absolute inset-0 bg-[#030208]" />
      
      {/* ── Main Nebula Core: Deep Indigo ── */}
      <motion.div
        animate={{
          rotate: [0, 5, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          x: useTransform(springX, (val) => val * 0.2),
          y: useTransform(springY, (val) => val * 0.2),
        }}
        className="absolute inset-[-20%] opacity-85 mix-blend-screen"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_#1E1B4B_0%,_#312E81_30%,_transparent_75%)] blur-[100px]" />
      </motion.div>

      {/* ── Dynamic Nebula Clouds: Electric Purple ── */}
      <motion.div
        animate={{
          rotate: [0, -8, 0],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          x: useTransform(springX, (val) => val * -0.5),
          y: useTransform(springY, (val) => val * -0.5),
        }}
        className="absolute inset-[-30%] opacity-95 mix-blend-screen"
      >
        <div className="absolute top-[10%] right-[0%] w-[90%] h-[90%] bg-[radial-gradient(circle,_rgba(124,58,237,0.4)_0%,_rgba(109,40,217,0.2)_40%,_transparent_75%)] blur-[120px] animate-cloud-drift" />
        <div className="absolute bottom-[0%] left-[-5%] w-[80%] h-[80%] bg-[radial-gradient(circle,_rgba(91,33,182,0.4)_0%,_rgba(76,29,149,0.2)_40%,_transparent_70%)] blur-[110px] animate-cloud-drift-slow" />
      </motion.div>

      {/* ── Accent Nebula: Deep Magenta ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.8),
          y: useTransform(springY, (val) => val * 0.8),
        }}
        className="absolute inset-[-10%] opacity-80 mix-blend-color-dodge"
      >
        <div className="absolute top-[30%] left-[20%] w-[60%] h-[60%] bg-[radial-gradient(circle,_#701a75_0%,_#4a044e_35%,_transparent_60%)] blur-[80px] animate-nebula-pulse" />
      </motion.div>

      {/* ── Gold Stardust Veil ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * -1.2),
          y: useTransform(springY, (val) => val * -1.2),
        }}
        className="absolute inset-[-5%] opacity-45"
      >
        <div className="absolute top-[5%] left-[50%] w-full h-full bg-[radial-gradient(circle,_rgba(212,168,95,0.2)_0%,_transparent_45%)] blur-[70px]" />
      </motion.div>

      {/* ── High-Fidelity Starfield (3 Layers) ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 2.5),
          y: useTransform(springY, (val) => val * 2.5),
        }}
        className="absolute inset-[-15%] z-[2]"
      >
        <div className="starfield-dynamic stars-large animate-star-twinkle" />
      </motion.div>

      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 1.5),
          y: useTransform(springY, (val) => val * 1.5),
        }}
        className="absolute inset-[-10%] z-[1]"
      >
        <div className="starfield-dynamic stars-medium opacity-75" />
      </motion.div>

      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.6),
          y: useTransform(springY, (val) => val * 0.6),
        }}
        className="absolute inset-[-5%] z-[0]"
      >
        <div className="starfield-dynamic stars-small opacity-55" />
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cloud-drift {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.6; }
          50% { transform: translate(4%, 3%) scale(1.08) rotate(2deg); opacity: 0.8; }
        }
        @keyframes cloud-drift-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(-3%, -2%) rotate(-3deg) scale(1.05); }
        }
        @keyframes nebula-pulse {
          0%, 100% { opacity: 0.4; filter: blur(90px); }
          50% { opacity: 0.7; filter: blur(75px); }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .animate-cloud-drift { animation: cloud-drift 28s infinite ease-in-out; }
        .animate-cloud-drift-slow { animation: cloud-drift-slow 40s infinite ease-in-out; }
        .animate-nebula-pulse { animation: nebula-pulse 15s infinite ease-in-out; }
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
