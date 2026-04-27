import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export const CosmicBackground: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      // Use requestAnimationFrame style logic implicitly by keeping state updates simple
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile]);

  const springX = useSpring(mousePosition.x, { stiffness: 50, damping: 20 });
  const springY = useSpring(mousePosition.y, { stiffness: 50, damping: 20 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] bg-[#0C0614]">
      {/* Deep Space Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--sc-bg-plum)_0%,_var(--sc-bg-ink)_100%)]" />

      {/* Nebula Layer 1 - Deep Purple */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.5),
          y: useTransform(springY, (val) => val * 0.5),
        }}
        className="absolute inset-[-10%] opacity-40 mix-blend-screen"
      >
        <div className="absolute top-[20%] left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,_rgba(124,58,237,0.15)_0%,_transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle,_rgba(139,92,246,0.1)_0%,_transparent_70%)] blur-[120px]" />
      </motion.div>

      {/* Nebula Layer 2 - Golden/Indigo */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * -0.8),
          y: useTransform(springY, (val) => val * -0.8),
        }}
        className="absolute inset-[-10%] opacity-30 mix-blend-overlay"
      >
        <div className="absolute top-[40%] right-[15%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,_rgba(242,201,76,0.05)_0%,_transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,_rgba(107,167,255,0.08)_0%,_transparent_70%)] blur-[90px]" />
      </motion.div>

      {/* Starfield Layer 1 - Tiny Stars */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 1.2),
          y: useTransform(springY, (val) => val * 1.2),
        }}
        className="absolute inset-[-5%] opacity-60"
      >
        <div className="starfield-layer" style={{ backgroundImage: 'radial-gradient(1px 1px at 10% 20%, white, transparent), radial-gradient(1px 1px at 30% 50%, white, transparent), radial-gradient(1px 1px at 50% 80%, white, transparent), radial-gradient(1px 1px at 80% 30%, white, transparent), radial-gradient(1px 1px at 90% 10%, white, transparent), radial-gradient(1.5px 1.5px at 15% 75%, white, transparent), radial-gradient(1px 1px at 45% 15%, white, transparent), radial-gradient(1.2px 1.2px at 65% 65%, white, transparent), radial-gradient(1px 1px at 25% 40%, white, transparent), radial-gradient(1px 1px at 75% 85%, white, transparent)' }} />
      </motion.div>

      {/* Starfield Layer 2 - Distant Stars */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.4),
          y: useTransform(springY, (val) => val * 0.4),
        }}
        className="absolute inset-[-2%] opacity-40"
      >
        <div className="starfield-layer" style={{ backgroundImage: 'radial-gradient(1px 1px at 5% 5%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 95% 95%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 50% 5%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 5% 50%, rgba(255,255,255,0.5), transparent)' }} />
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .starfield-layer {
          position: absolute;
          inset: 0;
          background-repeat: repeat;
          background-size: 50% 50%;
        }
      `}} />
    </div>
  );
};
