import { View, Text, StyleSheet } from 'react-native';
import type { HeatCell } from '../lib/insights';
import { theme } from '../theme';

export function Heatmap({ data, color = theme.accent.blue }: { data: HeatCell[][]; color?: string }) {
  const cell = 12, gap = 3;
  return (
    <View>
      <View style={{ flexDirection: 'row', gap }}>
        {data.map((week, wi) => (
          <View key={wi} style={{ gap }}>
            {week.map(c => (
              <View
                key={c.day}
                style={[
                  styles.cell,
                  { width: cell, height: cell },
                  c.done
                    ? { backgroundColor: color }
                    : { backgroundColor: theme.border.light },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>أقل</Text>
        {[0.25, 0.5, 0.75, 1].map((a, i) => (
          <View key={i} style={[styles.cell, { width: 10, height: 10, backgroundColor: color, opacity: a }]} />
        ))}
        <Text style={styles.legendText}>أكثر</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  cell: { borderRadius: 3 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  legendText: { color: theme.text.muted, fontSize: 10, marginHorizontal: 4 },
});
