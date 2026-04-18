import React from 'react';
import { C } from '../lib/theme.js';

export default function IrtahMark({ size = 28, light }) {
  const primary = light ? C.paper : C.terra400;
  const accent = light ? C.ink900 : C.ai500;
  return (
    <svg width={size} height={size} viewBox="0 0 280 280" aria-hidden="true">
      <path
        d="M140 40 C 195 40, 240 85, 240 140 C 240 195, 195 240, 140 240 C 180 210, 200 175, 200 140 C 200 105, 180 70, 140 40 Z"
        fill={primary}
      />
      <circle cx="100" cy="140" r="18" fill={accent} />
    </svg>
  );
}
