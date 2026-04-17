import React, { useEffect, useState } from 'react';
import { T } from '../lib/theme.js';
import { useT } from '../lib/i18n.js';

export default function Splash({ onEnter }) {
  const { t, dir } = useT();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(30px)',
        transition: 'all 1.2s cubic-bezier(.16,1,.3,1)',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 22,
          background: `linear-gradient(135deg, ${T.primary}, ${T.accent1})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 60px ${T.primary}50`,
          marginBottom: 24,
        }}
      >
        <span style={{ color: '#fff', fontSize: 36, fontWeight: 800, fontFamily: T.fontEn }}>SF</span>
      </div>
      <h1
        style={{
          fontFamily: T.fontEn,
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: -1,
          background: 'linear-gradient(135deg, #e0e7ff, #93c5fd, #c4b5fd)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 10,
        }}
      >
        SmartFlow
      </h1>
      <p style={{ fontFamily: T.font, color: T.textMuted, fontSize: 15, textAlign: 'center', marginBottom: 40, direction: dir }}>
        {t('splash.tagline')}
      </p>
      <button
        onClick={onEnter}
        style={{
          fontFamily: T.font,
          direction: dir,
          background: `linear-gradient(135deg, ${T.primary}, ${T.accent1})`,
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          padding: '14px 44px',
          fontSize: 17,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: `0 4px 24px ${T.primary}40`,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {t('splash.start')}
      </button>
    </div>
  );
}
