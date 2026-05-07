// Light Engineering palette — clean white, engineering blue, blueprint grid feel.
export const theme = {
  bg: {
    base: '#fcfcfd',
    surface: '#ffffff',
    grid: 'rgba(0, 86, 247, 0.06)',
    gridStrong: 'rgba(0, 86, 247, 0.18)',
  },
  text: {
    primary: '#1a1e23',
    secondary: '#475569',
    muted: '#64748b',
    inverse: '#ffffff',
  },
  border: {
    light: '#e2e8f0',
    blue: 'rgba(0, 86, 247, 0.18)',
    soft: 'rgba(0, 86, 247, 0.08)',
  },
  accent: {
    blue: '#0056f7',
    blueHover: '#0046cc',
    blueSoft: 'rgba(0, 86, 247, 0.10)',
    cyan: '#06b6d4',
    amber: '#f59e0b',
    green: '#10b981',
  },
  category: {
    residential: '#0056f7',
    commercial: '#7c3aed',
    industrial: '#f97316',
    public: '#10b981',
  },
  streak: {
    cold: '#94a3b8',
    cool: '#0056f7',
    warm: '#7c3aed',
    hot: '#f59e0b',
    blazing: '#ef4444',
  },
  danger: '#dc2626',
  success: '#10b981',
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  spacing: (n: number) => n * 4,
} as const;

export const PROJECT_COLORS = [
  '#0056f7', '#7c3aed', '#f97316', '#10b981',
  '#ec4899', '#06b6d4', '#f59e0b', '#dc2626',
];
