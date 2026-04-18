import React from 'react';
import { C } from '../lib/theme.js';

const stroke = (size = 20, s = 1.7) => ({
  width: size,
  height: size,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: s,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
});

export const I = {
  home: (
    <svg {...stroke()}>
      <path d="M3 12l9-9 9 9" />
      <path d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" />
    </svg>
  ),
  files: (
    <svg {...stroke()}>
      <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" />
      <path d="M14 3v6h6" />
    </svg>
  ),
  cal: (
    <svg {...stroke()}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  ),
  tasks: (
    <svg {...stroke()}>
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11" />
    </svg>
  ),
  ai: (
    <svg {...stroke()}>
      <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
    </svg>
  ),
  send: (
    <svg {...stroke(18)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  plus: (
    <svg {...stroke(18)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  star: (f) => (
    <svg
      width="16"
      height="16"
      fill={f ? C.terra400 : 'none'}
      stroke={f ? C.terra400 : 'currentColor'}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  check: (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  trash: (
    <svg {...stroke(15)}>
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
    </svg>
  ),
  edit: (
    <svg {...stroke(15)}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  search: (
    <svg {...stroke(16)}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  clock: (
    <svg {...stroke(12)}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  sparkle: (
    <svg {...stroke(14)}>
      <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
    </svg>
  ),
  bell: (
    <svg {...stroke(20)}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  settings: (
    <svg {...stroke(20)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  back: (
    <svg {...stroke()}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  outlook: (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="3" fill="#0078d4" />
      <text x="12" y="16" fontSize="11" fill="#fff" textAnchor="middle" fontWeight="700">O</text>
    </svg>
  ),
  excel: (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#107c41" />
      <text x="12" y="16" fontSize="11" fill="#fff" textAnchor="middle" fontWeight="700">X</text>
    </svg>
  ),
  word: (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#185abd" />
      <text x="12" y="16" fontSize="11" fill="#fff" textAnchor="middle" fontWeight="700">W</text>
    </svg>
  ),
};

const EXT_META = {
  xlsx: { bg: '#e7f1ea', color: '#5a8a6b', label: 'XLSX' },
  csv:  { bg: '#e7f1ea', color: '#5a8a6b', label: 'CSV' },
  docx: { bg: '#e3ecf3', color: '#3d7a9e', label: 'DOCX' },
  doc:  { bg: '#e3ecf3', color: '#3d7a9e', label: 'DOC' },
  pptx: { bg: C.terra100, color: C.terra600, label: 'PPTX' },
  msg:  { bg: C.sand200, color: C.ink700, label: 'MSG' },
  eml:  { bg: C.sand200, color: C.ink700, label: 'EML' },
};

export function FileBadge({ ext }) {
  const e = (ext || '').toLowerCase();
  const m = EXT_META[e] || { bg: C.sand200, color: C.ink700, label: e.toUpperCase() || 'FILE' };
  return (
    <div
      style={{
        background: m.bg,
        color: m.color,
        fontSize: 9,
        fontWeight: 600,
        padding: '3px 7px',
        borderRadius: 4,
        letterSpacing: 0.5,
        fontFamily: "'Geist Mono', ui-monospace, monospace",
      }}
    >
      {m.label}
    </div>
  );
}

export const extIcon = (ext) => <FileBadge ext={ext} />;
