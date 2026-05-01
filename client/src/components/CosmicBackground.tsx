import React, { useEffect, useState } from 'react';
import { motion, useTransform, useSpring } from 'framer-motion';

export const CosmicBackground: React.FC = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTilt({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };

    const interval = setInterval(() => {
      setTime(t => t + 0.016);
    }, 16);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  const springX = useSpring(tilt.x, { stiffness: 40, damping: 25 });
  const springY = useSpring(tilt.y, { stiffness: 40, damping: 25 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] bg-[#030208]">
      {/* ── SVG Filters for Real Nebula Textures ── */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="nebula-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="5" />
          <feColorMatrix values="0 0 0 0 0.5 0 0 0 0 0.2 0 0 0 0 0.8 0 0 0 1 0" />
        </filter>
        <filter id="nebula-glow">
          <feGaussianBlur stdDeviation="20" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </svg>

      {/* ── Base Deep Space ── */}
      <div className="absolute inset-0 bg-[#030208]" />

      {/* ── Layer 1: Dimensional Deep Nebula ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 0.3),
          y: useTransform(springY, (val) => val * 0.3),
          background: `
            radial-gradient(circle at ${40 + Math.sin(time * 0.2) * 20}% ${40 + Math.cos(time * 0.2) * 20}%, #1e1b4b 0%, transparent 70%),
            radial-gradient(circle at ${70 + Math.cos(time * 0.15) * 15}% ${60 + Math.sin(time * 0.15) * 15}%, #312e81 0%, transparent 70%)
          `,
          filter: 'blur(80px)',
        }}
        className="absolute inset-[-20%] opacity-80"
      />

      {/* ── Layer 2: PRIMARY NEBULA CLOUDS (Super High Visibility) ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * -0.6),
          y: useTransform(springY, (val) => val * -0.6),
        }}
        className="absolute inset-[-30%] opacity-100"
      >
        {/* Cloud 1: Intense Violet/Indigo Blast */}
        <div 
          className="absolute top-[5%] left-[0%] w-[90%] h-[90%] opacity-100"
          style={{
            background: `radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.85) 0%, rgba(88, 28, 135, 0.45) 45%, transparent 80%)`,
            mixBlendMode: 'screen',
            filter: 'blur(70px) contrast(1.4) saturate(1.8)',
            transform: `scale(${1.25 + Math.sin(time * 0.4) * 0.12}) rotate(${time * 1.5}deg)`,
          }}
        />
        
        {/* Cloud 2: Electric Magenta Drift */}
        <div 
          className="absolute bottom-[0%] right-[0%] w-[95%] h-[95%] opacity-95"
          style={{
            background: `radial-gradient(circle at 60% 60%, rgba(167, 139, 250, 0.8) 0%, rgba(109, 40, 217, 0.4) 50%, transparent 85%)`,
            mixBlendMode: 'color-dodge',
            filter: 'blur(65px) contrast(1.5) brightness(1.3)',
            transform: `scale(${1.2 + Math.cos(time * 0.3) * 0.1}) translate(${Math.sin(time * 0.5) * 30}px, ${Math.cos(time * 0.4) * 30}px)`,
          }}
        />

        {/* Cloud 3: Deep Space Void Softening */}
        <div 
          className="absolute top-[20%] right-[10%] w-[70%] h-[70%] opacity-60"
          style={{
            background: `radial-gradient(circle, rgba(12, 10, 48, 0.9) 0%, transparent 70%)`,
            mixBlendMode: 'multiply',
          }}
        />
      </motion.div>

      {/* ── Layer 3: Neon Magenta Energy (Dimensional Pop) ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * 1.2),
          y: useTransform(springY, (val) => val * 1.2),
        }}
        className="absolute inset-[-10%] opacity-80 mix-blend-plus-lighter"
      >
        <div 
          className="absolute top-[25%] left-[25%] w-[60%] h-[60%]"
          style={{
            background: `radial-gradient(circle, #e879f9 0%, transparent 70%)`,
            filter: 'blur(100px) brightness(1.8)',
            opacity: 0.7 + Math.sin(time * 0.8) * 0.25,
          }}
        />
      </motion.div>

      {/* ── Layer 4: Sacred Gold Dust ── */}
      <motion.div
        style={{
          x: useTransform(springX, (val) => val * -1.5),
          y: useTransform(springY, (val) => val * -1.5),
        }}
        className="absolute inset-[-5%] opacity-40 mix-blend-screen"
      >
        <div 
          className="absolute top-[20%] right-[20%] w-[60%] h-[60%]"
          style={{
            background: `radial-gradient(circle, rgba(212, 168, 95, 0.4) 0%, transparent 60%)`,
            filter: 'blur(70px) saturate(1.5)',
          }}
        />
      </motion.div>

      {/* ── High-Fidelity Stars ── */}
      <div className="absolute inset-0 opacity-80" style={{ background: 'url("/stars-pattern.png") repeat', backgroundSize: '400px' }} />
      
      {/* ── Starfield Twinkle (CSS) ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 10px white, 0 0 20px white;
        }
      `}} />

      {/* Manual Twinkling Stars */}
      {[...Array(30)].map((_, i) => (
        <div 
          key={i}
          className="star"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animation: `twinkle ${2 + Math.random() * 4}s infinite ease-in-out`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random() * 0.8 + 0.2,
          }}
        />
      ))}
    </div>
  );
};
