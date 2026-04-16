import React, { useState } from 'react';
import { T } from '../lib/theme.js';

export default function Card({ children, style, onClick, noPad }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover && onClick ? T.surfaceHover : T.surface,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${T.border}`,
        borderRadius: T.radius,
        padding: noPad ? 0 : '16px',
        transition: 'all 0.25s ease',
        cursor: onClick ? 'pointer' : 'default',
        transform: hover && onClick ? 'translateY(-1px)' : 'none',
        boxShadow: hover && onClick ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
