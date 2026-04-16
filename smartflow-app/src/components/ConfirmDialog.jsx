import React from 'react';
import { T } from '../lib/theme.js';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1e293b',
          borderRadius: 20,
          padding: 24,
          maxWidth: 320,
          width: '100%',
          border: `1px solid ${T.border}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <p style={{ fontFamily: T.font, color: T.text, fontSize: 15, lineHeight: 1.7, marginBottom: 20, textAlign: 'center' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              fontFamily: T.font,
              padding: 12,
              borderRadius: 12,
              border: 'none',
              background: T.danger,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            حذف
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              fontFamily: T.font,
              padding: 12,
              borderRadius: 12,
              border: 'none',
              background: T.surface,
              color: T.textMuted,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
