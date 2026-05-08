import { createContext, useContext, useEffect, useMemo } from 'react';
import { useFonts } from 'expo-font';
import type { Theme } from '../theme';
import { THEMES } from '../theme';
import { useStore } from '../store/projects';

interface Ctx {
  theme: Theme;
  fontsLoaded: boolean;
  toggle: () => void;
}

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useStore(s => s.themeMode);
  const toggleTheme = useStore(s => s.toggleTheme);

  // Load IBM Plex fonts. If they fail or aren't available, fall back to system.
  const [fontsLoaded] = useFonts({
    IBMPlexSansArabic: 'https://fonts.gstatic.com/s/ibmplexsansarabic/v12/Qw3CZRtWPQCuHme67tEYUIx3Kh0PHR9N6ZY.ttf',
    IBMPlexMono: 'https://fonts.gstatic.com/s/ibmplexmono/v19/-F63fjptAgt5VM-kVkqdyU8n5jE.ttf',
  });

  const value = useMemo<Ctx>(() => ({
    theme: THEMES[themeMode],
    fontsLoaded,
    toggle: toggleTheme,
  }), [themeMode, fontsLoaded, toggleTheme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const v = useContext(ThemeCtx);
  if (!v) throw new Error('ThemeProvider missing');
  return v;
}
