import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { Text, View } from 'react-native';
import { theme } from '../theme';
import type { StreakStats, Health } from '../lib/streak';
import { streakHealth } from '../lib/streak';

export function StreakRing({ stats, size = 84, rate, projectColor }: { stats: StreakStats; size?: number; rate?: number; projectColor?: string }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const fill = Math.max(0, Math.min(1, rate ?? stats.rate7));
  const tone = streakHealth(stats);
  const gradients: Record<Health, [string, string]> = {
    cold: [theme.streak.cold, theme.text.muted],
    cool: [theme.streak.cool, theme.accent.cyan],
    warm: [theme.streak.warm, theme.streak.cool],
    hot: [theme.streak.hot, theme.streak.warm],
    blazing: [theme.streak.blazing, theme.streak.hot],
  };
  const [g1, g2] = projectColor ? [projectColor, projectColor] : gradients[tone];

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGrad id="g" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={g1} />
            <Stop offset="1" stopColor={g2} />
          </SvgGrad>
        </Defs>
        <Circle cx={size/2} cy={size/2} r={r} stroke={theme.border.light} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size/2} cy={size/2} r={r}
          stroke="url(#g)" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - fill)}
          strokeLinecap="round" fill="none"
          rotation={-90} origin={`${size/2}, ${size/2}`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: theme.text.primary, fontSize: size * 0.28, fontWeight: '800' }}>{stats.current}</Text>
        <Text style={{ color: theme.text.muted, fontSize: size * 0.13, marginTop: -2 }}>يوم</Text>
      </View>
    </View>
  );
}
