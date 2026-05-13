import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import type { Theme } from '../theme';
import { THEMES } from '../theme';

interface Ctx {
  theme: Theme;
  fontsLoaded: boolean;
  toggle: () => void;
}

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme(); // 'dark' | 'light' | null — follows OS automatically
  const [fontsLoaded] = useFonts({
    IBMPlexSansArabic: 'https://fonts.gstatic.com/s/ibmplexsansarabic/v12/Qw3CZRtWPQCuHme67tEYUIx3Kh0PHR9N6ZY.ttf',
    IBMPlexMono: 'https://fonts.gstatic.com/s/ibmplexmono/v19/-F63fjptAgt5VM-kVkqdyU8n5jE.ttf',
  });
  const mode = scheme === 'light' ? 'light' : 'dark';
  const value = useMemo<Ctx>(() => ({
    theme: THEMES[mode],
    fontsLoaded,
    toggle: () => {}, // noop: system controls it
  }), [mode, fontsLoaded]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const v = useContext(ThemeCtx);
  if (!v) throw new Error('ThemeProvider missing');
  return v;
}
