import React, { useEffect, useState } from 'react';
import { C, F } from '../lib/theme.js';
import IrtahMark from '../components/IrtahMark.jsx';
import { useT } from '../lib/i18n.js';

export default function Splash({ onEnter, onLanding }) {
  const { t, dir, lang } = useT();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShow(true), 250);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(24px)',
        transition: 'all 1s cubic-bezier(.16,1,.3,1)',
        direction: dir,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <IrtahMark size={96} />
      </div>
      <h1
        style={{
          fontFamily: F.display,
          fontSize: lang === 'ar' ? 70 : 58,
          fontWeight: 600,
          color: C.ink900,
          letterSpacing: lang === 'ar' ? 0 : -1,
          margin: 0,
          lineHeight: 1,
        }}
      >
        {lang === 'ar' ? 'ارتَح' : 'Irtah'}
      </h1>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          letterSpacing: 3,
          color: C.terra500,
          marginTop: 8,
          textTransform: 'uppercase',
        }}
      >
        {t('splash.brandline')}
      </div>
      <p
        style={{
          fontFamily: F.ui,
          color: C.ink600,
          fontSize: 15,
          textAlign: 'center',
          marginTop: 22,
          marginBottom: 32,
          lineHeight: 1.8,
          maxWidth: 320,
        }}
      >
        {t('splash.tagline')}
      </p>
      <button
        onClick={onEnter}
        style={{
          fontFamily: F.ui,
          background: C.terra500,
          color: C.paper,
          border: 'none',
          borderRadius: 14,
          padding: '14px 44px',
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(184,82,46,0.25)',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(184,82,46,0.3)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(184,82,46,0.25)'; }}
      >
        {t('splash.start')}
      </button>
      {onLanding && (
        <button
          onClick={onLanding}
          style={{
            marginTop: 14,
            fontFamily: F.ui,
            background: 'transparent',
            color: C.ink600,
            border: 'none',
            fontSize: 13,
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 4,
          }}
        >
          {t('splash.learnMore')}
        </button>
      )}
    </div>
  );
}
