import React from 'react';
import { T } from '../lib/theme.js';
import { I } from './Icons.jsx';
import { useT } from '../lib/i18n.js';

export default function Nav({ active, setPage, pendingCount }) {
  const { t } = useT();
  const items = [
    { id: 'home',     icon: I.home,  label: t('nav.home'),     badge: 0 },
    { id: 'files',    icon: I.files, label: t('nav.files'),    badge: 0 },
    { id: 'schedule', icon: I.cal,   label: t('nav.schedule'), badge: 0 },
    { id: 'tasks',    icon: I.tasks, label: t('nav.tasks'),    badge: pendingCount },
    { id: 'ai',       icon: I.ai,    label: t('nav.ai'),       badge: 0 },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(8,11,20,0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${T.border}`,
        display: 'flex',
        justifyContent: 'space-around',
        padding: '6px 0 18px',
        maxWidth: 430,
        margin: '0 auto',
      }}
    >
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => setPage(it.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            color: active === it.id ? T.primary : T.textDim,
            transition: 'all 0.2s',
            padding: '6px 10px',
          }}
        >
          <div style={{ transform: active === it.id ? 'scale(1.12)' : 'none', transition: 'transform 0.2s' }}>
            {it.icon}
          </div>
          <span style={{ fontFamily: T.font, fontSize: 10, fontWeight: active === it.id ? 600 : 400 }}>
            {it.label}
          </span>
          {it.badge > 0 && (
            <div
              style={{
                position: 'absolute',
                top: -2,
                right: 8,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: T.danger,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                color: '#fff',
                fontWeight: 700,
                fontFamily: T.fontEn,
              }}
            >
              {it.badge}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
