import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export const CosmicBackground: React.FC = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTilt({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        setTilt({
          x: (e.gamma / 45) * 20,
          y: (e.beta / 90) * 20,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  const springX = useSpring(0, { stiffness: 35, damping: 25 });
  const springY = useSpring(0, { stiffness: 35, damping: 25 });

  useEffect(() => {
    springX.set(tilt.x);
    springY.set(tilt.y);
  }, [tilt, springX, springY]);

  // Layers of movement
  const deepX = useTransform(springX, (val) => val * 0.2);
  const deepY = useTransform(springY, (val) => val * 0.2);
  const midX = useTransform(springX, (val) => val * 0.6);
  const midY = useTransform(springY, (val) => val * 0.6);
  const closeX = useTransform(springX, (val) => val * 1.2);
  const closeY = useTransform(springY, (val) => val * 1.2);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] bg-[#070014]">
      {/* ── Base Layer: The Void ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#120622_0%,_#070014_100%)]" />

      {/* ── Layer 1: Ethereal Core Glow ── */}
      <motion.div
        style={{ x: deepX, y: deepY }}
        className="absolute inset-[-20%] opacity-30 mix-blend-screen"
      >
        <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,_rgba(244,197,66,0.05)_0%,_transparent_70%)] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle,_rgba(45,226,255,0.05)_0%,_transparent_70%)] blur-[100px]" />
      </motion.div>

      {/* ── Layer 2: Deep Nebula Clouds ── */}
      <motion.div
        style={{ x: midX, y: midY }}
        className="absolute inset-[-20%] mix-blend-screen"
      >
        {/* Deep Indigo "Thunder" Clouds */}
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_20%_30%,_rgba(124,58,237,0.15)_0%,_transparent_60%)] blur-[100px]" />
        
        {/* Gold "Solar" Nebula */}
        <div className="absolute top-[20%] right-[10%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,_rgba(244,197,66,0.08)_0%,_transparent_70%)] blur-[120px]" />
        
        {/* Soft Cyan Whisper */}
        <div className="absolute top-[40%] left-[30%] w-[60%] h-[60%] bg-[radial-gradient(circle,_rgba(45,226,255,0.04)_0%,_transparent_60%)] blur-[80px]" />
      </motion.div>

      {/* ── Layer 3: High-Res Texture ── */}
      <motion.div
        style={{ x: deepX, y: deepY }}
        className="absolute inset-[-5%] opacity-20 mix-blend-color-dodge"
      >
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("/nebula-bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'hue-rotate(240deg) contrast(1.2) brightness(0.8) saturate(0.8)'
          }}
        />
      </motion.div>

      {/* ── Layer 4: Floating Celestial Dust ── */}
      <motion.div
        style={{ x: closeX, y: closeY }}
        className="absolute inset-[-25%]"
      >
        {/* Large Cinematic Stars */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={`l-star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              top: `${(i * 137) % 100}%`,
              left: `${(i * 151) % 100}%`,
              width: i % 3 === 0 ? '2px' : '1px',
              height: i % 3 === 0 ? '2px' : '1px',
              boxShadow: i % 3 === 0 ? '0 0 10px 1px white, 0 0 20px 2px rgba(244, 197, 66, 0.3)' : 'none',
              opacity: 0.6,
              animation: `slow-twinkle ${10 + (i % 8)}s infinite ease-in-out`,
              animationDelay: `${i * 0.8}s`
            }}
          />
        ))}

        {/* Dense Star Clusters */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 20% 30%, #fff, transparent),
              radial-gradient(1.2px 1.2px at 40% 70%, #fff, transparent),
              radial-gradient(1px 1px at 60% 20%, #fff, transparent),
              radial-gradient(1.5px 1.5px at 80% 40%, #fff, transparent),
              radial-gradient(1px 1px at 10% 90%, #fff, transparent),
              radial-gradient(1px 1px at 90% 10%, #fff, transparent)
            `,
            backgroundSize: '400px 400px'
          }}
        />
      </motion.div>

      {/* ── Layer 5: Deep Vignette ── */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(7, 0, 20, 0.8) 100%)',
          boxShadow: 'inset 0 0 150px rgba(0, 0, 0, 0.8)'
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nebula-pulse {
          0% { transform: scale(1) rotate(0deg); opacity: 0.5; }
          100% { transform: scale(1.1) rotate(3deg); opacity: 0.8; }
        }
        @keyframes slow-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); filter: blur(0px); }
          50% { opacity: 1; transform: scale(1.2); filter: blur(1px); }
        }
      `}} />
    </div>
  );
};
