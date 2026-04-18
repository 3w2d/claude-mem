import React from 'react';
import { C, GRAIN } from '../lib/theme.js';

export default function Background({ dark }) {
  const base = dark ? C.ink900 : C.sand50;
  const glow1 = dark ? 'rgba(107,82,184,0.18)' : 'rgba(208,106,66,0.10)';
  const glow2 = dark ? 'rgba(61,122,158,0.12)' : 'rgba(149,132,212,0.08)';
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: base, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-15%',
          width: 520,
          height: 520,
          background: `radial-gradient(circle, ${glow1} 0%, transparent 65%)`,
          borderRadius: '50%',
          filter: 'blur(70px)',
          animation: 'floatA 22s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: 420,
          height: 420,
          background: `radial-gradient(circle, ${glow2} 0%, transparent 65%)`,
          borderRadius: '50%',
          filter: 'blur(70px)',
          animation: 'floatB 26s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: GRAIN,
          opacity: dark ? 0.35 : 0.5,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />
      <style>{`
        @keyframes floatA { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-40px,30px) } }
        @keyframes floatB { 0%,100% { transform: translate(0,0) } 50% { transform: translate(30px,-40px) } }
      `}</style>
    </div>
  );
}
