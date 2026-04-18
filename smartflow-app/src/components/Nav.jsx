import React from 'react';
import { C, F } from '../lib/theme.js';
import { I } from './Icons.jsx';
import { useT } from '../lib/i18n.js';

export default function Nav({ active, setPage, pendingCount, isDark }) {
  const { t } = useT();
  const items = [
    { id: 'home',     icon: I.home,  label: t('nav.home'),     badge: 0 },
    { id: 'files',    icon: I.files, label: t('nav.files'),    badge: 0 },
    { id: 'schedule', icon: I.cal,   label: t('nav.schedule'), badge: 0 },
    { id: 'tasks',    icon: I.tasks, label: t('nav.tasks'),    badge: pendingCount },
    { id: 'ai',       icon: I.ai,    label: t('nav.ai'),       badge: 0 },
  ];

  const bg = isDark ? 'rgba(28,24,20,0.92)' : 'rgba(255,252,245,0.94)';
  const border = isDark ? C.ink700 : C.sand200;
  const idleColor = isDark ? C.sand400 : C.sand500;
  const activeColor = isDark ? C.terra300 : C.terra500;

  return (
    <nav
      aria-label="Primary"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: bg,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: `1px solid ${border}`,
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0 18px',
        maxWidth: 430,
        margin: '0 auto',
      }}
    >
      {items.map((it) => {
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setPage(it.id)}
            aria-label={it.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              color: isActive ? activeColor : idleColor,
              transition: 'all 0.2s',
              padding: '6px 10px',
              minWidth: 54,
            }}
          >
            <div style={{ transform: isActive ? 'scale(1.12)' : 'none', transition: 'transform 0.2s' }}>
              {it.icon}
            </div>
            <span style={{ fontFamily: F.ui, fontSize: 10, fontWeight: isActive ? 600 : 400 }}>
              {it.label}
            </span>
            {it.badge > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: -2,
                  right: 8,
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                  borderRadius: 8,
                  background: C.urgent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  color: '#fff',
                  fontWeight: 700,
                  fontFamily: F.mono,
                }}
              >
                {it.badge}
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
}
