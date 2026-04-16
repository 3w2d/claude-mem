import React from 'react';
import { T } from '../lib/theme.js';

export default function Background() {
  const blobs = [
    { top: '-25%', right: '-15%', w: 700, color: '99,102,241', opacity: 0.07, dur: '18s', idx: 0 },
    { bottom: '-20%', left: '-10%', w: 500, color: '14,165,233', opacity: 0.05, dur: '22s', idx: 1 },
    { top: '50%', left: '40%', w: 350, color: '245,158,11', opacity: 0.04, dur: '14s', idx: 2 },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: T.bg, overflow: 'hidden' }}>
      {blobs.map((b) => (
        <div
          key={b.idx}
          style={{
            position: 'absolute',
            ...(b.top !== undefined && { top: b.top }),
            ...(b.bottom !== undefined && { bottom: b.bottom }),
            ...(b.left !== undefined && { left: b.left }),
            ...(b.right !== undefined && { right: b.right }),
            width: b.w,
            height: b.w,
            background: `radial-gradient(circle, rgba(${b.color},${b.opacity}) 0%, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: `f${b.idx} ${b.dur} ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes f0 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-50px,30px) } }
        @keyframes f1 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(40px,-50px) } }
        @keyframes f2 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-30px,-40px) } }
      `}</style>
    </div>
  );
}
