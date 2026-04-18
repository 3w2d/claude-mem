import React, { useState } from 'react';
import { C, T } from '../lib/theme.js';

export default function Card({ children, style, onClick, noPad, dark }) {
  const [hover, setHover] = useState(false);
  const bg = dark ? C.ink800 : C.paper;
  const border = dark ? C.ink700 : C.sand200;
  const hoverBg = dark ? C.ink700 : C.sand50;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover && onClick ? hoverBg : bg,
        border: `1px solid ${border}`,
        borderRadius: 18,
        padding: noPad ? 0 : 16,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
        cursor: onClick ? 'pointer' : 'default',
        transform: hover && onClick ? 'translateY(-1px)' : 'none',
        boxShadow: hover && onClick
          ? (dark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 6px 20px rgba(61,53,43,0.08)')
          : (dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 2px rgba(61,53,43,0.04)'),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
