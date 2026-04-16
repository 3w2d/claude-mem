import React from 'react';
import { T } from '../lib/theme.js';

export default function Loading() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${T.primary}, ${T.accent1})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'loadPulse 1.5s ease-in-out infinite',
        }}
      >
        <span style={{ color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: T.fontEn }}>SF</span>
      </div>
      <p style={{ fontFamily: T.font, color: T.textMuted, fontSize: 14 }}>جاري التحميل...</p>
      <style>{`@keyframes loadPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:0.8}}`}</style>
    </div>
  );
}
