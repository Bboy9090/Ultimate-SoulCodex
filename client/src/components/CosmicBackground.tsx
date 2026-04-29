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

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!e.beta || !e.gamma) return;
      // beta: -180 to 180 (tilt front/back)
      // gamma: -90 to 90 (tilt left/right)
      // Normalize to around 45 degree holding position for beta
      const x = (e.gamma / 45) * 20; 
      const y = ((e.beta - 45) / 45) * 20; 
      setTilt({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const springX = useSpring(tilt.x, { stiffness: 40, damping: 25 });
  const springY = useSpring(tilt.y, { stiffness: 40, damping: 25 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] bg-[#0C0614]">
      {/* Deep Space Foundation */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1A0B2E_0%,_#0D0B21_100%)]" />

      {/* Nebula Drift Layer 1 - Deep Purple/Blue */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.4),
          y: useTransform(springY, (val) => val * 0.4),
          rotate: useTransform(springX, (val) => val * 0.05),
        }}
        className="absolute inset-[-20%] opacity-40 mix-blend-screen"
      >
        <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,_rgba(124,58,237,0.2)_0%,_transparent_70%)] blur-[120px] animate-nebula-pulse" />
        <div className="absolute bottom-[0%] right-[0%] w-[90%] h-[90%] rounded-full bg-[radial-gradient(circle,_rgba(76,29,149,0.15)_0%,_transparent_70%)] blur-[140px]" />
      </motion.div>

      {/* Nebula Drift Layer 2 - Gold/Electric Violet */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * -0.6),
          y: useTransform(springY, (val) => val * -0.6),
        }}
        className="absolute inset-[-15%] opacity-30 mix-blend-overlay"
      >
        <div className="absolute top-[30%] right-[20%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,_rgba(212,168,95,0.08)_0%,_transparent_60%)] blur-[90px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,_rgba(139,92,246,0.12)_0%,_transparent_60%)] blur-[100px]" />
      </motion.div>

      {/* Starfield Layer 1 - Close Stars (Fast Parallax) */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 1.5),
          y: useTransform(springY, (val) => val * 1.5),
        }}
        className="absolute inset-[-10%] opacity-70"
      >
        <div className="starfield-dynamic stars-large" />
      </motion.div>

      {/* Starfield Layer 2 - Mid Stars */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.8),
          y: useTransform(springY, (val) => val * 0.8),
        }}
        className="absolute inset-[-5%] opacity-50"
      >
        <div className="starfield-dynamic stars-medium" />
      </motion.div>

      {/* Starfield Layer 3 - Distant Dust (Slow Parallax) */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.3),
          y: useTransform(springY, (val) => val * 0.3),
        }}
        className="absolute inset-[-2%] opacity-30"
      >
        <div className="starfield-dynamic stars-small" />
      </motion.div>

      {/* Interactive Flare Overlay */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,168,95,0.03)_0%,transparent_50%)]"
        style={{
          x: useTransform(springX, (val) => val * 2),
          y: useTransform(springY, (val) => val * 2),
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nebula-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-nebula-pulse {
          animation: nebula-pulse 20s infinite ease-in-out;
        }
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
            radial-gradient(2px 2px at 50% 10%, #fff, transparent),
            radial-gradient(2px 2px at 10% 90%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 75% 25%, #FFD700, transparent);
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
