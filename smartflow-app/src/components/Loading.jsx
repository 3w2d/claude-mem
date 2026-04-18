import React from 'react';
import { C, F } from '../lib/theme.js';
import IrtahMark from './IrtahMark.jsx';
import { useT } from '../lib/i18n.js';

export default function Loading() {
  const { t } = useT();
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: C.sand50,
      }}
    >
      <div style={{ animation: 'loadPulse 1.6s ease-in-out infinite' }}>
        <IrtahMark size={56} />
      </div>
      <p style={{ fontFamily: F.ui, color: C.sand500, fontSize: 14 }}>
        {t('common.loading')}
      </p>
      <style>{`@keyframes loadPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:0.82}}`}</style>
    </div>
  );
}
