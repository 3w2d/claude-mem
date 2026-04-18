import React from 'react';
import { C, F } from '../lib/theme.js';
import { useT } from '../lib/i18n.js';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  const { t, dir } = useT();
  return (
    <div
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(28,24,20,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.paper,
          borderRadius: 20,
          padding: 24,
          maxWidth: 340,
          width: '100%',
          border: `1px solid ${C.sand200}`,
          boxShadow: '0 20px 60px rgba(28,24,20,0.25)',
          direction: dir,
        }}
      >
        <p style={{ fontFamily: F.ui, color: C.ink900, fontSize: 15, lineHeight: 1.7, marginBottom: 20, textAlign: 'center' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              fontFamily: F.ui,
              padding: 12,
              borderRadius: 12,
              border: 'none',
              background: C.urgent,
              color: C.paper,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('common.delete')}
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              fontFamily: F.ui,
              padding: 12,
              borderRadius: 12,
              border: `1px solid ${C.sand200}`,
              background: C.sand50,
              color: C.ink700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
