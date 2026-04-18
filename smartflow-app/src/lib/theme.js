// Irtah design tokens — warm paper, ink, terracotta, violet AI accent.
export const C = {
  // Sand — warm paper
  sand50: '#fbf7f1',
  sand100: '#f5eee1',
  sand200: '#ebdfc9',
  sand300: '#d9c8a9',
  sand400: '#b8a381',
  sand500: '#8f7a5a',
  // Ink
  ink900: '#1c1814',
  ink800: '#2a241d',
  ink700: '#3d352b',
  ink600: '#544a3d',
  ink500: '#6d6151',
  // Terracotta — primary warm accent
  terra50: '#fcf1ec',
  terra100: '#f7dccf',
  terra200: '#efb89d',
  terra300: '#e08d68',
  terra400: '#d06a42',
  terra500: '#b8522e',
  terra600: '#943f23',
  // Violet — AI-only
  ai50: '#f1edfa',
  ai100: '#ddd3f3',
  ai300: '#9584d4',
  ai500: '#6b52b8',
  ai700: '#4a3889',
  // Semantic
  urgent: '#c83a3a',
  urgentBg: '#fbe9e9',
  medium: '#c88a2e',
  mediumBg: '#fbf0dd',
  normal: '#5a8a6b',
  normalBg: '#e7f1ea',
  moss: '#5a8a6b',
  sky: '#3d7a9e',
  paper: '#fffcf5',
};

export const F = {
  ui: "'Rubik', 'Readex Pro', system-ui, sans-serif",
  display: "'Markazi Text', 'Rubik', serif",
  mono: "'Geist Mono', ui-monospace, monospace",
};

export const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1  0 0 0 0 0.09  0 0 0 0 0.08  0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

export const priorityColor = { high: C.urgent, medium: C.medium, low: C.normal };
export const priorityBg = { high: C.urgentBg, medium: C.mediumBg, low: C.normalBg };

// Back-compat: legacy `T` maps old names to new tokens so any lingering consumer keeps working.
export const T = {
  bg: C.sand50,
  surface: C.paper,
  surfaceHover: C.sand100,
  border: C.sand200,
  text: C.ink900,
  textMuted: C.sand500,
  textDim: C.sand400,
  primary: C.terra500,
  primaryBg: C.terra50,
  accent1: C.sky,
  accent2: C.medium,
  accent3: C.moss,
  danger: C.urgent,
  warning: C.medium,
  font: F.ui,
  fontEn: F.ui,
  radius: '18px',
  radiusSm: '14px',
};

// Arabic-Indic digits helper reused across pages.
const AR_NUMS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
export const toAr = (n, lang) =>
  lang === 'en' ? String(n) : String(n).replace(/\d/g, (d) => AR_NUMS[d]);
