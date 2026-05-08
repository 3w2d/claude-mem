// Rukiza design system — dark gold engineering aesthetic.
// OKLCH from the reference HTML translated to RN-compatible hex / rgba.

export type ThemeMode = 'dark' | 'light';

export interface Theme {
  mode: ThemeMode;
  bg: { base: string; elevated: string; card: string; panel: string; input: string; overlay: string };
  border: { soft: string; strong: string; gold: string };
  text: { primary: string; secondary: string; muted: string; inverse: string };
  gold: { base: string; bright: string; dim: string; glow: string; soft: string };
  copper: string;
  blueprint: string;
  blueprintSoft: string;
  danger: string;
  success: string;
  warn: string;
  grid: string;
}

const dark: Theme = {
  mode: 'dark',
  bg: {
    base:     '#0a0a10',
    elevated: '#13141d',
    card:     '#171922',
    panel:    '#0e1018',
    input:    '#10121b',
    overlay:  'rgba(8,8,14,0.85)',
  },
  border: {
    soft:   '#363946',
    strong: '#4a4d5e',
    gold:   'rgba(201,151,58,0.32)',
  },
  text: {
    primary:   '#ebebef',
    secondary: '#a4a4ab',
    muted:     '#727580',
    inverse:   '#0a0a10',
  },
  gold:    { base: '#c9973a', bright: '#e6b34a', dim: '#9a7028', glow: 'rgba(201,151,58,0.18)', soft: 'rgba(201,151,58,0.10)' },
  copper:  '#a86850',
  blueprint: '#5294e8',
  blueprintSoft: 'rgba(82,148,232,0.10)',
  danger:  '#e64a3e',
  success: '#3eb887',
  warn:    '#d8b35a',
  grid:    'rgba(50,53,67,0.5)',
};

const light: Theme = {
  mode: 'light',
  bg: {
    base:     '#fafafb',
    elevated: '#ffffff',
    card:     '#fdfdfe',
    panel:    '#f3f4f7',
    input:    '#ffffff',
    overlay:  'rgba(20,22,30,0.4)',
  },
  border: {
    soft:   '#e1e2ea',
    strong: '#cbcdd6',
    gold:   'rgba(201,151,58,0.42)',
  },
  text: {
    primary:   '#181a22',
    secondary: '#5b5e6a',
    muted:     '#84879a',
    inverse:   '#ffffff',
  },
  gold:    { base: '#c9973a', bright: '#e6b34a', dim: '#9a7028', glow: 'rgba(201,151,58,0.20)', soft: 'rgba(201,151,58,0.08)' },
  copper:  '#a86850',
  blueprint: '#3a78c4',
  blueprintSoft: 'rgba(58,120,196,0.10)',
  danger:  '#dc3a30',
  success: '#1f9b6a',
  warn:    '#c9963c',
  grid:    'rgba(60,68,90,0.10)',
};

export const THEMES: Record<ThemeMode, Theme> = { dark, light };

// 4 px spacing scale.
export const sp = (n: number) => n * 4;
export const SP = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80 } as const;

export const RADIUS = { xs: 4, sm: 6, md: 10, lg: 14, xl: 20, pill: 999 } as const;

export const FONT = {
  arabic: 'IBMPlexSansArabic',
  mono: 'IBMPlexMono',
} as const;

// Font fallback — when custom font isn't loaded, RN uses system. Helper to
// pass undefined so default is used (system Arabic on iOS/Android handles RTL).
export function font(face: 'arabic' | 'mono' | undefined, loaded: boolean): string | undefined {
  if (!loaded || !face) return undefined;
  return face === 'mono' ? FONT.mono : FONT.arabic;
}
