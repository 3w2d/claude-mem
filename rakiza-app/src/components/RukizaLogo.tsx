import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';
import { View, Text } from 'react-native';
import { useTheme } from './ThemeProvider';
import { FONT } from '../theme';

interface Props {
  size?: number;
  showText?: boolean;
}

export function RukizaLogo({ size = 32, showText = true }: Props) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: size * 0.32 }}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Defs>
          <LinearGradient id="lg-rk" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.gold.bright} />
            <Stop offset="1" stopColor={theme.gold.dim} />
          </LinearGradient>
        </Defs>
        <Rect x={4}  y={32} width={32} height={2}  rx={1} fill="url(#lg-rk)" />
        <Rect x={6}  y={14} width={4}  height={18} rx={1} fill="url(#lg-rk)" opacity={0.85} />
        <Rect x={12} y={8}  width={4}  height={24} rx={1} fill="url(#lg-rk)" />
        <Rect x={18} y={11} width={4}  height={21} rx={1} fill="url(#lg-rk)" opacity={0.92} />
        <Rect x={24} y={6}  width={4}  height={26} rx={1} fill="url(#lg-rk)" />
        <Rect x={30} y={13} width={4}  height={19} rx={1} fill="url(#lg-rk)" opacity={0.85} />
        <Path d="M 6 14 Q 20 4 34 14" fill="none" stroke={theme.gold.base} strokeWidth={0.8} opacity={0.4} />
      </Svg>
      {showText && (
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{
            fontSize: size * 0.62,
            fontWeight: '700',
            color: theme.gold.base,
            letterSpacing: -0.2,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
            lineHeight: size * 0.68,
          }}>ركيزة</Text>
          <Text style={{
            fontSize: size * 0.26,
            color: theme.text.muted,
            letterSpacing: 1.4,
            fontFamily: fontsLoaded ? FONT.mono : undefined,
            marginTop: 1,
          }}>SBC · ACI</Text>
        </View>
      )}
    </View>
  );
}
